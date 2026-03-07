import { ResultAsync } from 'neverthrow';
import { CantOpenDbError, IndexDbBlockedError } from '@/storage/indexeddb/client/errors';
import { UnknownError } from '@/error';
export type OpenDbError = CantOpenDbError | IndexDbBlockedError | UnknownError;
export declare function initDb(): Promise<void>;
export declare function getDb(): ResultAsync<import("./db").SecureChatDatabase, never>;
export declare function resetDbConnectionForTestsOnly(): void;
