import { errAsync, fromPromise, ResultAsync } from 'neverthrow';
import type {
    LoadMessagesParams,
    MarkAsDeletedFromServerParams,
    MarkAsDeliveredParams,
    MarkAsReadParams,
    MessageRepository,
} from '@/storage/facade';
import type { StorageError } from '@/storage/errors';
import { makeValidationError } from '@/storage/errors';
import { MessageDirection, type StoredMessage } from '@/storage/types';
import { db } from './db';
import { UnknownError } from '@/error';
import { always } from 'ramda';

type MessageRecord = StoredMessage & { peerPublicKeyHex: string };

const toRecord = (message: StoredMessage): MessageRecord => {
    const peerPublicKeyHex =
        message.direction === MessageDirection.Incoming ? message.sender : message.recipient;
    return { ...message, peerPublicKeyHex };
};

const fromRecord = (record: MessageRecord): StoredMessage => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { peerPublicKeyHex, ...rest } = record;
    return rest;
};

export class IndexedDbMessageRepository implements MessageRepository {
    public addMessages(messages: StoredMessage[]): ResultAsync<StoredMessage[], StorageError> {
        if (!Array.isArray(messages) || messages.length === 0) {
            return errAsync(makeValidationError('messages must be a non-empty array'));
        }

        for (const message of messages) {
            if (!message.id) return errAsync(makeValidationError('message.id is required'));
            if (!message.owner) return errAsync(makeValidationError('owner is required'));
            if (!message.createdAt) return errAsync(makeValidationError('createdAt is required'));
            if (!message.encrypted) return errAsync(makeValidationError('encrypted is required'));
            if (message.direction === MessageDirection.Incoming && !message.sender) {
                return errAsync(makeValidationError('sender is required for incoming messages'));
            }
            if (message.direction === MessageDirection.Outgoing && !message.recipient) {
                return errAsync(makeValidationError('recipient is required for outgoing messages'));
            }
        }

        return fromPromise(
            db.messages.bulkPut(messages.map(toRecord)).then(always(messages)),
            (error) => new UnknownError(error),
        );
    }

    public loadMessages(params: LoadMessagesParams): ResultAsync<StoredMessage[], StorageError> {
        const { limit = 1_000, dateGte, dateLte, owner, publicKeyHex } = params;

        if (!owner) return errAsync(makeValidationError('owner is required'));
        if (!publicKeyHex) return errAsync(makeValidationError('publicKeyHex is required'));

        return fromPromise(
            (async () => {
                const lowerDate = typeof dateGte === 'number' ? dateGte : 0;
                const upperDate = typeof dateLte === 'number' ? dateLte : Number.POSITIVE_INFINITY;

                // Используем составной индекс [owner+peerPublicKeyHex+createdAt]
                const collection = db.messages
                    .where('[owner+peerPublicKeyHex+createdAt]')
                    .between(
                        [owner, publicKeyHex, lowerDate],
                        [owner, publicKeyHex, upperDate],
                        true,
                        true,
                    )
                    .reverse(); // newest -> oldest

                const records = await collection.limit(limit).toArray();
                return records.map((record) => fromRecord(record));
            })(),
            (error) => new UnknownError(error),
        );
    }

    public filterKnownIds(ids: string[]): ResultAsync<Set<string>, StorageError> {
        if (!Array.isArray(ids) || ids.length === 0) {
            return errAsync(makeValidationError('ids must be a non-empty array'));
        }

        // Dexie bulkGet сохраняет порядок входного массива и возвращает undefined, если ключ не найден.
        return fromPromise(
            (async () => {
                const records = await db.messages.bulkGet(ids);
                const known = new Set<string>();
                for (let i = 0; i < records.length; i++) {
                    const r = records[i];
                    if (r) {
                        known.add(r.id);
                    }
                }
                return known;
            })(),
            (error) => new UnknownError(error),
        );
    }

    public getMessagesByIds(ids: string[]): ResultAsync<StoredMessage[], StorageError> {
        if (!Array.isArray(ids) || ids.length === 0) {
            return errAsync(makeValidationError('ids must be a non-empty array'));
        }

        return fromPromise(
            (async () => {
                const records = await db.messages.bulkGet(ids);
                const found: StoredMessage[] = [];
                for (const r of records) {
                    if (r) {
                        found.push(fromRecord(r as unknown as MessageRecord));
                    }
                }
                return found;
            })(),
            (error) => new UnknownError(error),
        );
    }

    public listUniquePeerIds(owner: string): ResultAsync<string[], StorageError> {
        if (!owner) return errAsync(makeValidationError('owner is required'));

        return fromPromise(
            (async () => {
                const records = await db.messages.where('owner').equals(owner).toArray();
                const unique = new Set<string>();
                for (const r of records) {
                    // peerPublicKeyHex хранится только в записи (record)
                    unique.add((r as unknown as MessageRecord).peerPublicKeyHex);
                }
                return Array.from(unique).filter(Boolean);
            })(),
            (error) => new UnknownError(error),
        );
    }

    public markAsDeletedFromServer(
        params: MarkAsDeletedFromServerParams,
    ): ResultAsync<void, StorageError> {
        if (!params.id) return errAsync(makeValidationError('id is required'));

        return fromPromise(
            (async () => {
                const existing = await db.messages.get(params.id);
                if (!existing || existing.direction === MessageDirection.Outgoing) {
                    // нет сообщения – считаем, что уже "удалено"
                    return;
                }

                const message = fromRecord(existing);

                if (message.direction === MessageDirection.Outgoing) {
                    return;
                }

                const next: StoredMessage = {
                    ...message,
                    deletedFromServer: true,
                };
                await db.messages.put(toRecord(next));
            })(),
            (error) => new UnknownError(error),
        );
    }

    public markAsRead(params: MarkAsReadParams): ResultAsync<void, StorageError> {
        if (!params.id) return errAsync(makeValidationError('id is required'));

        const readAt = Date.now();

        return fromPromise(
            (async () => {
                const existing = await db.messages.get(params.id);
                if (!existing) {
                    return;
                }

                const message = fromRecord(existing);

                if (message.direction === MessageDirection.Outgoing) {
                    return;
                }

                const next: StoredMessage = { ...message, readAt };
                await db.messages.put(toRecord(next));
            })(),
            (error) => new UnknownError(error),
        );
    }

    public markAsDelivered(params: MarkAsDeliveredParams): ResultAsync<void, StorageError> {
        if (!params.id) return errAsync(makeValidationError('id is required'));

        return fromPromise(
            (async () => {
                const existing = await db.messages.get(params.id);
                if (!existing) {
                    return;
                }

                const message = fromRecord(existing);

                if (message.direction !== MessageDirection.Outgoing) {
                    return;
                }

                const next: StoredMessage = {
                    ...message,
                    delivered: true,
                };

                await db.messages.put(toRecord(next));
            })(),
            (error) => new UnknownError(error),
        );
    }

    public deleteMessage(id: string): ResultAsync<void, StorageError> {
        if (!id) return errAsync(makeValidationError('id is required'));

        return fromPromise(
            db.messages.delete(id).then(() => undefined),
            (error) => new UnknownError(error),
        );
    }
}
