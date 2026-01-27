import { appD } from '@/model/app';
import type { IncomingMessage, OutgoingMessage, Stored, StoredMessage } from '@/storage';
import { MessageDirection } from '@/storage';
import { attach, sample } from 'effector';
import { createGate } from 'effector-react';
import { isNotNil, prop } from 'ramda';
import { createPoll } from '@/utils/createaPoll';
import { $storage } from '@/model/storage';
import { $keyPair, $pk, $token } from '@/model/user';
import { $selectedContact, refreshContactsMeta } from '@/model/contacts';
import { encodeText, encrypt } from '@/lib/crypto';
import sodium from 'libsodium-wrappers';

import type { Contact } from '@/components/messenger/types';
import type { KeyPair } from '@/utils/seedHelpers';
import { fetchMessagesFx, sendDeliveredFx, sendMessageFx } from './api';
import type { SendMessageFxProps } from './api';
import { loadMessagesFx, markAsDeletedFromServerFx, markAsReadFx, saveMessagesFx } from './storage';
import { $messages } from './store';

export const MessagesGate = createGate({
    domain: appD,
    name: 'MessagesGate',
});

export const sendMessage = appD.createEvent<string>();
export const markMessageAsRead = appD.createEvent<string>(); // messageId

type SendMessageSource = {
    recipient: Contact | null;
    keyPair: KeyPair | null;
    token: string | null;
};

function canSendMessage(
    source: SendMessageSource,
    _message: string
): source is { recipient: Contact; keyPair: KeyPair; token: string } {
    return !!source.recipient && !!source.keyPair && !!source.token;
}

const getMessagesForResendFx = attach({
    effect: appD.createEffect((messages: StoredMessage[]) =>
        messages.filter((msg) => {
            if (msg.direction === MessageDirection.Incoming) {
                return false;
            }
            return !msg.delivered;
        })),
    source: $messages,
});

const getDeliveredMessagesFx = attach({
    effect: appD.createEffect((messages: StoredMessage[]) => {
        return messages
            .filter((msg): msg is Stored<IncomingMessage> => msg.direction === MessageDirection.Incoming)
            .filter((msg) => !msg.deletedFromServer);
    }),
    source: $messages,
});

// 3) Всё, что получили с сервера и ещё не подтверждено локально, подтверждаем на сервере
sample({
    clock: getDeliveredMessagesFx.doneData,
    source: $token,
    filter: (token, messages) => !!token && messages.length > 0,
    fn: (token, messages) => ({ token: token as string, messages }),
    target: sendDeliveredFx,
});

// После успешной пометки на сервере — помечаем локально как deletedFromServer
sample({
    clock: sendDeliveredFx.done,
    fn: (data) => data.params.messages.map(prop('id')),
    target: markAsDeletedFromServerFx,
});

// Полим подтверждение доставленности входящих
createPoll({
    domain: appD,
    fx: getDeliveredMessagesFx,
    delay: 1_000,
    gate: MessagesGate,
});

// Полим повторную отправку исходящих, если не доставлены
createPoll({
    domain: appD,
    fx: getMessagesForResendFx,
    delay: 1_000,
    gate: MessagesGate,
});

// 2) Полим новые сообщения с сервера
createPoll({
    domain: appD,
    launchAfterDelay: true,
    fx: fetchMessagesFx,
    source: { pk: $pk, token: $token },
    fn: (source) => ({
        token: source.token!,
        pk: source.pk!,
    }),
    gate: MessagesGate,
    delay: 1_000,
});

// При наличии недоставленных исходящих — пытаемся отправить первое
sample({
    clock: getMessagesForResendFx.doneData,
    source: $token,
    filter: (token, messages) => !!token && messages.length > 0,
    fn: (token, messages) => ({
        token: token as string,
        message: messages[0]!,
    }),
    target: sendMessageFx,
});

// После успешной отправки исходящего — сохраняем в БД delivered=true
sample({
    clock: sendMessageFx.done,
    source: $storage,
    fn: (storage, call) => ({
        messages: [{ ...(call.params.message as Stored<OutgoingMessage>), delivered: true }],
        storage,
    }),
    target: saveMessagesFx,
});

// Пометка прочитанным: view -> event -> effect
sample({
    clock: markMessageAsRead,
    target: markAsReadFx,
});

// После успешной пометки прочитанным — обновляем метаданные контакта (unread/lastMessage)
sample({
    clock: markAsReadFx.done,
    source: $messages,
    filter: (messages, { params: messageId }) => {
        const msg = messages.find((m) => m.id === messageId);
        return !!msg && msg.direction === MessageDirection.Incoming;
    },
    fn: (messages, { params: messageId }) => {
        const msg = messages.find((m) => m.id === messageId);
        return msg && msg.direction === MessageDirection.Incoming ? [msg.sender] : [];
    },
    target: refreshContactsMeta,
});

// 1) При смене контакта — грузим сообщения из БД
sample({
    clock: $selectedContact,
    filter: isNotNil,
    fn: (contact) => ({ contactId: contact!.id }),
    target: loadMessagesFx,
});

// Создаём исходящее сообщение, шифруем, отправляем
sample({
    clock: sendMessage,
    source: { recipient: $selectedContact, keyPair: $keyPair, token: $token },
    filter: canSendMessage,
    fn: (
        { keyPair, recipient, token }: { recipient: Contact; keyPair: KeyPair; token: string },
        message: string
    ): SendMessageFxProps => ({
        message: {
            id: window.crypto.randomUUID(),
            recipient: recipient.id,
            encrypted: sodium.to_base64(encrypt(encodeText(message), keyPair, sodium.from_hex(recipient.id))),
            createdAt: Date.now(),
            direction: MessageDirection.Outgoing,
            delivered: false,
            owner: sodium.to_hex(keyPair.publicKey),
        },
        token,
    }),
    target: sendMessageFx,
});

// Новые сообщения с сервера — сохраняем в БД и стор (через saveMessagesFx.doneData -> $messages)
sample({
    clock: fetchMessagesFx.doneData,
    source: $storage,
    filter: (_, messages) => messages.length > 0,
    fn: (storage, messages) => ({ storage, messages }),
    target: saveMessagesFx,
});

// После сохранения новых сообщений — обновляем метаданные затронутых контактов
sample({
    clock: saveMessagesFx.doneData,
    fn: (messages) => {
        const ids = new Set<string>();
        for (const m of messages) {
            if (m.direction === MessageDirection.Incoming) {
                ids.add(m.sender);
            } else {
                ids.add(m.recipient);
            }
        }
        return Array.from(ids);
    },
    filter: (ids) => ids.length > 0,
    target: refreshContactsMeta,
});

export { $messages };

