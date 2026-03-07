import { ResultAsync } from 'neverthrow';
import type { LoadMessagesParams, MarkAsDeletedFromServerParams, MarkAsDeliveredParams, MarkAsReadParams, MessageRepository } from '@/storage/facade';
import type { StorageError } from '@/storage/errors';
import { type StoredMessage } from '@/storage/types';
export declare class IndexedDbMessageRepository implements MessageRepository {
    addMessages(messages: StoredMessage[]): ResultAsync<StoredMessage[], StorageError>;
    loadMessages(params: LoadMessagesParams): ResultAsync<StoredMessage[], StorageError>;
    filterKnownIds(ids: string[]): ResultAsync<Set<string>, StorageError>;
    getMessagesByIds(ids: string[]): ResultAsync<StoredMessage[], StorageError>;
    listUniquePeerIds(owner: string): ResultAsync<string[], StorageError>;
    markAsDeletedFromServer(params: MarkAsDeletedFromServerParams): ResultAsync<void, StorageError>;
    markAsRead(params: MarkAsReadParams): ResultAsync<void, StorageError>;
    markAsDelivered(params: MarkAsDeliveredParams): ResultAsync<void, StorageError>;
    deleteMessage(id: string): ResultAsync<void, StorageError>;
}
