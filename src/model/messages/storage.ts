import { appD } from '@/model/app';
import type { PublicKeyHex, StorageFacade, StoredMessage } from '@/storage';
import { fromAsyncResult } from '@/lib/fromResult';
import { attach } from 'effector';
import { $storage } from '@/model/storage';
import { $pk } from '@/model/user';
import asyncMap from '@tsigel/async-map';
import { prop } from 'ramda';

export type SaveMessagesProps = {
    messages: StoredMessage[];
    storage: StorageFacade;
};

export const saveMessagesFx = appD.createEffect(({ messages, storage }: SaveMessagesProps) => {
    return fromAsyncResult(storage.messages.addMessages(messages));
});

export type LoadMessagesFxProps = {
    storage: StorageFacade;
    contactId: PublicKeyHex;
    owner: PublicKeyHex;
};

export const loadMessagesFx = attach({
    effect: appD.createEffect(({ storage, contactId, owner }: LoadMessagesFxProps) => {
        return fromAsyncResult(storage.messages.loadMessages({ owner, publicKeyHex: contactId }));
    }),
    source: { owner: $pk, storage: $storage },
    mapParams: ({ contactId }: { contactId: string }, { owner, storage }): LoadMessagesFxProps => ({
        owner: owner!,
        storage,
        contactId,
    }),
});

export type MarkAsDeliveredFxProps = {
    storage: StorageFacade;
    messageId: string;
};

export const markAsDeliveredFx = attach({
    effect: appD.createEffect(({ storage, messageId }: MarkAsDeliveredFxProps) => {
        return fromAsyncResult(storage.messages.markAsDelivered({ id: messageId }));
    }),
    source: { storage: $storage },
    mapParams: (messageId: string, source) => ({ ...source, messageId }),
});

export type MarkAsReadFxProps = {
    storage: StorageFacade;
    messageId: string;
};

export const markAsReadFx = attach({
    effect: appD.createEffect(({ storage, messageId }: MarkAsReadFxProps) => {
        return fromAsyncResult(storage.messages.markAsRead({ id: messageId }));
    }),
    source: { storage: $storage },
    mapParams: (messageId: string, source) => ({ ...source, messageId }),
});

export type MarkAsDeletedFromServerFxProps = {
    storage: StorageFacade;
    ids: string[];
};

/**
 * Помечает входящие сообщения как "удалённые с сервера" (т.е. уже подтверждённые / delivered)
 * в локальной БД. Возвращает список id, которые удалось пометить (ошибки глотаем).
 */
export const markAsDeletedFromServerFx = attach({
    effect: appD.createEffect(async ({ storage, ids }: MarkAsDeletedFromServerFxProps) => {
        const results = await asyncMap(
            5,
            async (id) => {
                try {
                    await fromAsyncResult(storage.messages.markAsDeletedFromServer({ id }));
                    return { ok: true as const, id };
                } catch (error) {
                    console.error('Error marking message as deleted from server', error);
                    return { ok: false as const, id };
                }
            },
            ids,
        );

        return results.filter(prop('ok')).map(prop('id'));
    }),
    source: $storage,
    mapParams: (ids: string[], storage): MarkAsDeletedFromServerFxProps => ({ storage, ids }),
});

markAsDeletedFromServerFx.watch((params) => {
    console.log('markAsDeletedFromServerFx called with', params);
});
markAsDeletedFromServerFx.done.watch((result) => {
    console.log('markAsDeletedFromServerFx done', result);
});
markAsDeletedFromServerFx.fail.watch((result) => {
    console.error('markAsDeletedFromServerFx fail', result);
});
