import Dexie, { type Table } from 'dexie';
import type { StoredContact, StoredMessage } from '@/storage/types';

type ContactRecord = StoredContact & { nameLower: string };
type MessageRecord = StoredMessage & { peerPublicKeyHex: string };

export class SecureChatDatabase extends Dexie {
    contacts!: Table<ContactRecord, string>;
    messages!: Table<MessageRecord, string>;

    constructor() {
        super('securechat-db');

        this.version(1).stores({
            contacts: 'id, nameLower, owner',
            messages: 'id, [owner+peerPublicKeyHex+createdAt], [owner+direction+delivered], owner',
        });
    }
}

export const db = new SecureChatDatabase();
