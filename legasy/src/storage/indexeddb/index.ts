import { ResultAsync } from 'neverthrow';
import type { StorageFacade } from '@/storage/facade';
import { initDb, OpenDbError } from '@/storage/indexeddb/client';
import { IndexedDbAddressBookRepository } from '@/storage/indexeddb/IndexedDbAddressBookRepository';
import { IndexedDbMessageRepository } from '@/storage/indexeddb/IndexedDbMessageRepository';
import { fromPromise } from 'neverthrow';
import { CantOpenDbError, IndexDbBlockedError } from '@/storage/indexeddb/client/errors';
import { UnknownError } from '@/error';

export class WebStorage implements StorageFacade {
    public readonly contacts = new IndexedDbAddressBookRepository();
    public readonly messages = new IndexedDbMessageRepository();

    public init(): ResultAsync<void, OpenDbError> {
        return fromPromise(initDb(), (error: unknown): OpenDbError => {
            if (error instanceof CantOpenDbError || error instanceof IndexDbBlockedError) {
                return error;
            }
            if (error instanceof Error) {
                if (error.name === 'BlockedError') {
                    return new IndexDbBlockedError('IndexedDB open is blocked');
                }
                return new CantOpenDbError(error.message);
            }
            return new UnknownError(error);
        });
    }
}
