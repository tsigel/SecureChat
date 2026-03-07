import Dexie, { type Table } from 'dexie';
import type { StoredContact, StoredMessage } from '@/storage/types';
type ContactRecord = StoredContact & {
    nameLower: string;
};
type MessageRecord = StoredMessage & {
    peerPublicKeyHex: string;
};
export declare class SecureChatDatabase extends Dexie {
    contacts: Table<ContactRecord, string>;
    messages: Table<MessageRecord, string>;
    constructor();
}
export declare const db: SecureChatDatabase;
export {};
