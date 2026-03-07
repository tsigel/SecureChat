import { ResultAsync } from 'neverthrow';
import { CantOpenDbError, IndexDbBlockedError } from '@/storage/indexeddb/client/errors';
import { UnknownError } from '@/error';
import { db } from './db';
let dbInitialized = false;
export async function initDb() {
    if (typeof indexedDB === 'undefined') {
        throw new CantOpenDbError('indexedDB is not available in this environment');
    }
    try {
        await db.open();
        dbInitialized = true;
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === 'BlockedError') {
                throw new IndexDbBlockedError('IndexedDB open is blocked');
            }
            throw new CantOpenDbError(error.message);
        }
        throw new UnknownError(error);
    }
}
export function getDb() {
    if (!dbInitialized) {
        return ResultAsync.fromSafePromise(initDb()).map(() => db);
    }
    return ResultAsync.fromSafePromise(Promise.resolve(db));
}
export function resetDbConnectionForTestsOnly() {
    db.close();
    dbInitialized = false;
}
//# sourceMappingURL=client.js.map