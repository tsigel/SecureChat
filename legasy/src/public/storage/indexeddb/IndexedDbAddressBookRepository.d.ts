import { ResultAsync } from 'neverthrow';
import type { AddressBookRepository, ListContactsOptions } from '@/storage/facade';
import type { StorageError } from '@/storage/errors';
import type { PublicKeyHex, StoredContact } from '@/storage/types';
export declare class IndexedDbAddressBookRepository implements AddressBookRepository {
    upsertContact(contact: StoredContact): ResultAsync<StoredContact, StorageError>;
    getContactByPublicKey(owner: PublicKeyHex, publicKeyHex: PublicKeyHex): ResultAsync<StoredContact | null, StorageError>;
    listContacts(options: ListContactsOptions): ResultAsync<StoredContact[], StorageError>;
    deleteContact(publicKeyHex: PublicKeyHex, owner: PublicKeyHex): ResultAsync<void, StorageError>;
}
