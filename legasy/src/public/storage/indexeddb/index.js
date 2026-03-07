import { initDb } from '@/storage/indexeddb/client';
import { IndexedDbAddressBookRepository } from '@/storage/indexeddb/IndexedDbAddressBookRepository';
import { IndexedDbMessageRepository } from '@/storage/indexeddb/IndexedDbMessageRepository';
import { fromPromise } from 'neverthrow';
import { CantOpenDbError, IndexDbBlockedError } from '@/storage/indexeddb/client/errors';
import { UnknownError } from '@/error';
export class WebStorage {
    constructor() {
        this.contacts = new IndexedDbAddressBookRepository();
        this.messages = new IndexedDbMessageRepository();
    }
    init() {
        return fromPromise(initDb(), (error) => {
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
//# sourceMappingURL=index.js.map