import { ResultAsync } from 'neverthrow';
import type { StorageFacade } from '@/storage/facade';
import { OpenDbError } from '@/storage/indexeddb/client';
import { IndexedDbAddressBookRepository } from '@/storage/indexeddb/IndexedDbAddressBookRepository';
import { IndexedDbMessageRepository } from '@/storage/indexeddb/IndexedDbMessageRepository';
export declare class WebStorage implements StorageFacade {
    readonly contacts: IndexedDbAddressBookRepository;
    readonly messages: IndexedDbMessageRepository;
    init(): ResultAsync<void, OpenDbError>;
}
