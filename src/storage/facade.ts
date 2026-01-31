import type { ResultAsync } from 'neverthrow';

import type { PublicKeyHex, StoredContact, StoredMessage } from '@/storage/types';
import type { StorageError } from '@/storage/errors';

export type ListContactsOptions = {
    search?: string;
    limit?: number;
    owner: string;
};

export type MarkAsReadParams = {
    id: string;
};

export type MarkAsDeletedFromServerParams = {
    id: string;
}

export type MarkAsDeliveredParams = {
    id: string;
}

export type LoadMessagesParams = {
    limit?: number;
    dateGte?: number;
    dateLte?: number;
    owner?: string;
    publicKeyHex?: string;
}

export interface AddressBookRepository {
    upsertContact(contact: StoredContact): ResultAsync<StoredContact, StorageError>;

    listContacts(options?: ListContactsOptions): ResultAsync<StoredContact[], StorageError>;

    deleteContact(publicKeyHex: PublicKeyHex, owner: PublicKeyHex): ResultAsync<void, StorageError>;
}

export interface MessageRepository {
    addMessages(message: StoredMessage[]): ResultAsync<StoredMessage[], StorageError>;

    loadMessages(params: LoadMessagesParams): ResultAsync<StoredMessage[], StorageError>;

    /**
     * Возвращает множество id, которые уже существуют в локальной БД.
     * Полезно для дедупликации сообщений, пришедших с сервера.
     */
    filterKnownIds(ids: string[]): ResultAsync<Set<string>, StorageError>;

    /**
     * Загружает сообщения по первичным ключам (id). Возвращает только найденные.
     * Нужен для проверки статусов (например deletedFromServer) для уже известных сообщений.
     */
    getMessagesByIds(ids: string[]): ResultAsync<StoredMessage[], StorageError>;

    /**
     * Возвращает список peer-адресов, с которыми есть сообщения (входящие/исходящие),
     * включая адреса, которых может не быть в адресной книге.
     */
    listUniquePeerIds(owner: PublicKeyHex): ResultAsync<PublicKeyHex[], StorageError>;

    markAsDeletedFromServer(params: MarkAsDeletedFromServerParams): ResultAsync<void, StorageError>;

    markAsRead(params: MarkAsReadParams): ResultAsync<void, StorageError>;

    markAsDelivered(params: MarkAsDeliveredParams): ResultAsync<void, StorageError>;

    deleteMessage(id: string): ResultAsync<void, StorageError>;
}

export interface StorageFacade {
    /**
     * Optional initialization hook for implementations (e.g. open DB, run migrations).
     * Safe to call multiple times.
     */
    init(): ResultAsync<void, StorageError>;

    contacts: AddressBookRepository;
    messages: MessageRepository;
}

