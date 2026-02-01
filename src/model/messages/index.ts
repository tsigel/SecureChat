import { appD } from '@/model/app';
import type { IncomingMessage, OutgoingMessage, Stored, StoredMessage } from '@/storage';
import { MessageDirection } from '@/storage';
import { attach, combine, sample } from 'effector';
import { createGate } from 'effector-react';
import { isNotNil, prop } from 'ramda';
import { createPoll } from '@/utils/createaPoll';
import { $storage } from '@/model/storage';
import { $keyPair, $pk, $token } from '@/model/user';
import { $selectedContact, refreshContactsMeta, refreshUnknownChats } from '@/model/contacts';
import { $soundEnabled } from '@/model/settings';
import { encodeText, encrypt } from '@/lib/crypto';
import sodium from 'libsodium-wrappers';
import type { Contact } from '@/components/messenger/types';
import type { KeyPair } from '@/utils/seedHelpers';
import type { SendMessageFxProps } from './api';
import { fetchMessagesFx, sendDeliveredFx, sendMessageFx } from './api';
import { loadMessagesFx, markAsDeletedFromServerFx, markAsReadFx, saveMessagesFx } from './storage';
import { $messages } from './store';
import type { StorageFacade } from '@/storage';
import { fromAsyncResult } from '@/lib/fromResult';
import { isNetworkError } from '@/lib/isNetworkError';
import { $isOnline } from '@/model/network';

export const MessagesGate = createGate({
    domain: appD,
    name: 'MessagesGate',
});

export const sendMessage = appD.createEvent<string>();
export const markMessageAsRead = appD.createEvent<string>(); // messageId

const newIncomingMessagesReceived = appD.createEvent<Stored<IncomingMessage>[]>();

let notificationAudio: HTMLAudioElement | null = null;
const playNotificationSoundFx = appD.createEffect(async () => {
    try {
        if (!notificationAudio) {
            notificationAudio = new Audio('/notification.mp3');
        }
        await notificationAudio.play();
    } catch {
        // блокировка автоплея / другие ошибки — игнорируем
    }
});

// В тестовой среде апстрим может отдавать редиректы/страницы логина на неавторизованные запросы,
// поэтому поллинг должен быть "пустым" пока нет token/pk (чтобы не ловить redirect-loop).
const pollFetchMessagesFx = appD.createEffect(
    async ({ token, pk }: { token: string | null; pk: string | null }) => {
        if (!token || !pk) {
            return [] as StoredMessage[];
        }
        return await fetchMessagesFx({ token, pk });
    },
);

export const $messagesPollUnavailable = appD
    .createStore<boolean>(false)
    .on(pollFetchMessagesFx.failData, (state, error) => (isNetworkError(error) ? true : state))
    .on(pollFetchMessagesFx.done, () => false)
    .reset(MessagesGate.close);

export const $showOfflineBanner = combine(
    $isOnline,
    $messagesPollUnavailable,
    (isOnline, pollUnavailable) => !isOnline || pollUnavailable,
);

type SendMessageSource = {
    recipient: Contact | null;
    keyPair: KeyPair | null;
    token: string | null;
};

function canSendMessage(
    source: SendMessageSource,
    _message: string,
): source is { recipient: Contact; keyPair: KeyPair; token: string } {
    return !!source.recipient && !!source.keyPair && !!source.token;
}

type SplitFetchedMessagesParams = {
    storage: StorageFacade;
    messages: StoredMessage[];
};

type SplitFetchedMessagesResult = {
    newMessages: StoredMessage[];
    knownIds: string[];
};

const splitFetchedMessagesFx = appD.createEffect(
    async ({
        storage,
        messages,
    }: SplitFetchedMessagesParams): Promise<SplitFetchedMessagesResult> => {
        const ids = messages.map((m) => m.id).filter(Boolean);
        if (!ids.length) {
            return { newMessages: [], knownIds: [] };
        }

        const known = await fromAsyncResult(storage.messages.filterKnownIds(ids));
        const newMessages: StoredMessage[] = [];
        const knownIds: string[] = [];

        for (const m of messages) {
            if (known.has(m.id)) {
                knownIds.push(m.id);
            } else {
                newMessages.push(m);
            }
        }

        return { newMessages, knownIds };
    },
);

// Триггерим уведомление о новых входящих (глобально, не только в активном чате)
sample({
    clock: splitFetchedMessagesFx.doneData,
    filter: ({ newMessages }) =>
        newMessages.some((m) => m.direction === MessageDirection.Incoming && !m.deletedFromServer),
    fn: ({ newMessages }) =>
        newMessages
            .filter((m): m is Stored<IncomingMessage> => m.direction === MessageDirection.Incoming)
            .filter((m) => !m.deletedFromServer),
    target: newIncomingMessagesReceived,
});

sample({
    clock: newIncomingMessagesReceived,
    source: $soundEnabled,
    filter: (enabled) => !!enabled,
    target: playNotificationSoundFx,
});

type GetAckNeededKnownMessagesParams = {
    storage: StorageFacade;
    knownIds: string[];
};

const getAckNeededKnownMessagesFx = appD.createEffect(
    async ({ storage, knownIds }: GetAckNeededKnownMessagesParams) => {
        if (!knownIds.length) {
            return [] as Stored<IncomingMessage>[];
        }

        const existing = await fromAsyncResult(storage.messages.getMessagesByIds(knownIds));
        return existing
            .filter((m): m is Stored<IncomingMessage> => m.direction === MessageDirection.Incoming)
            .filter((m) => !m.deletedFromServer);
    },
);

// Известные (уже в БД) сообщения: если ещё не подтверждены локально — подтверждаем на сервере и помечаем локально.
sample({
    clock: getAckNeededKnownMessagesFx.doneData,
    source: $token,
    filter: (token, messages) => !!token && messages.length > 0,
    fn: (token, messages) => ({ token: token as string, messages }),
    target: sendDeliveredFx,
});

sample({
    clock: sendDeliveredFx.done,
    fn: (data) => data.params.messages.map(prop('id')),
    target: markAsDeletedFromServerFx,
});

// Новые входящие сообщения (после сохранения) тоже подтверждаем на сервере
sample({
    clock: saveMessagesFx.doneData,
    source: $token,
    filter: (token, saved) =>
        !!token &&
        saved.some((m) => m.direction === MessageDirection.Incoming && !m.deletedFromServer),
    fn: (token, saved) => ({
        token: token as string,
        messages: saved
            .filter((m): m is Stored<IncomingMessage> => m.direction === MessageDirection.Incoming)
            .filter((m) => !m.deletedFromServer),
    }),
    target: sendDeliveredFx,
});

// 2) Полим новые сообщения с сервера
createPoll({
    domain: appD,
    launchAfterDelay: true,
    fx: pollFetchMessagesFx,
    source: { pk: $pk, token: $token },
    fn: (source) => ({ token: source.token, pk: source.pk }),
    gate: MessagesGate,
    delay: 1_000,
});

// После успешной отправки исходящего — сохраняем в БД delivered=true
sample({
    clock: sendMessageFx.done,
    source: $storage,
    fn: (storage, { params, result }) => ({
        messages: [
            {
                ...(params.message as Omit<Stored<OutgoingMessage>, 'id'>),
                id: result.id,
                delivered: true,
            },
        ],
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
        message: string,
    ): SendMessageFxProps => ({
        message: {
            recipient: recipient.id,
            encrypted: sodium.to_base64(
                encrypt(encodeText(message), keyPair, sodium.from_hex(recipient.id)),
            ),
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
    clock: pollFetchMessagesFx.doneData,
    source: $storage,
    filter: (_, messages) => messages.length > 0,
    fn: (storage, messages): SplitFetchedMessagesParams => ({ storage, messages }),
    target: splitFetchedMessagesFx,
});

// Новые сообщения — сохраняем в БД
sample({
    clock: splitFetchedMessagesFx.doneData,
    source: $storage,
    fn: (storage, { newMessages }) => ({ storage, messages: newMessages }),
    filter: (_, { newMessages }) => newMessages.length > 0,
    target: saveMessagesFx,
});

// Известные сообщения — проверяем статусы из БД и при необходимости подтверждаем
sample({
    clock: splitFetchedMessagesFx.doneData,
    source: $storage,
    fn: (storage, { knownIds }): GetAckNeededKnownMessagesParams => ({ storage, knownIds }),
    filter: (_, { knownIds }) => knownIds.length > 0,
    target: getAckNeededKnownMessagesFx,
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

// Обновляем список "неизвестных" чатов при появлении новых входящих
sample({
    clock: saveMessagesFx.doneData,
    filter: (messages) => messages.some((m) => m.direction === MessageDirection.Incoming),
    target: refreshUnknownChats,
});

export { $messages };
