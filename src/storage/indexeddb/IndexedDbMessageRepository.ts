import { errAsync, fromPromise, ResultAsync } from 'neverthrow';
import type { MarkAsDeletedFromServerParams, MarkAsReadParams, MessageRepository, } from '@/storage/facade';
import type { StorageError } from '@/storage/errors';
import { makeValidationError } from '@/storage/errors';
import { MessageDirection, type StoredMessage } from '@/storage/types';
import { LoadMessagesParams } from '@/storage/facadeParams/LoadMessagesParams';
import { db } from './db';
import { UnknownError } from '@/error';

type MessageRecord = StoredMessage & { peerPublicKeyHex: string };

export class IndexedDbMessageRepository implements MessageRepository {
    private toRecord(message: StoredMessage): MessageRecord {
        const peerPublicKeyHex = message.direction === MessageDirection.Incoming
            ? message.sender
            : message.recipient;
        return { ...message, peerPublicKeyHex };
    }

    private fromRecord(record: MessageRecord): StoredMessage {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { peerPublicKeyHex, ...rest } = record;
        return rest;
    }

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
            db.messages.bulkPut(messages.map((msg) => this.toRecord(msg))).then(() => messages),
            (error) => new UnknownError(error)
        );
    }

    public loadMessages(params: LoadMessagesParams): ResultAsync<StoredMessage[], StorageError> {
        const { limit, dateGte, dateLte, userPublicKeyHex, publicKeyHex } = params;

        if (!userPublicKeyHex) return errAsync(makeValidationError('userPublicKeyHex is required'));
        if (!publicKeyHex) return errAsync(makeValidationError('publicKeyHex is required'));

        return fromPromise(
            (async () => {
                const lowerDate = typeof dateGte === 'number' ? dateGte : 0;
                const upperDate = typeof dateLte === 'number' ? dateLte : Number.POSITIVE_INFINITY;

                // Используем составной индекс [owner+peerPublicKeyHex+createdAt]
                const collection = db.messages
                    .where('[owner+peerPublicKeyHex+createdAt]')
                    .between([userPublicKeyHex, publicKeyHex, lowerDate], [userPublicKeyHex, publicKeyHex, upperDate], true, true)
                    .reverse(); // newest -> oldest

                const records = await collection.limit(limit).toArray();
                return records.map((record) => this.fromRecord(record));
            })(),
            (error) => new UnknownError(error)
        );
    }

    public markAsDeletedFromServer(params: MarkAsDeletedFromServerParams): ResultAsync<void, StorageError> {
        if (!params.id) return errAsync(makeValidationError('id is required'));

        return fromPromise(
            (async () => {
                const existing = await db.messages.get(params.id);
                if (!existing) {
                    // нет сообщения – считаем, что уже "удалено"
                    return;
                }

                const message = this.fromRecord(existing);

                if (message.direction === MessageDirection.Outgoing) {
                    return void 0;
                }

                const next: StoredMessage = {
                    ...message,
                    deletedFromServer: true
                };
                await db.messages.put(this.toRecord(next));
            })(),
            (error) => new UnknownError(error)
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

                const message = this.fromRecord(existing);

                if (message.direction === MessageDirection.Outgoing) {
                    return;
                }

                const next: StoredMessage = { ...message, readAt };
                await db.messages.put(this.toRecord(next));
                return;
            })(),
            (error) => new UnknownError(error)
        );
    }

    public deleteMessage(id: string): ResultAsync<void, StorageError> {
        if (!id) return errAsync(makeValidationError('id is required'));

        return fromPromise(
            db.messages.delete(id).then(() => undefined),
            (error) => new UnknownError(error)
        );
    }
}
