import Dexie from 'dexie';
export class SecureChatDatabase extends Dexie {
    constructor() {
        super('securechat-db');
        this.version(1).stores({
            contacts: '[owner+id], nameLower, owner',
            messages: 'id, [owner+peerPublicKeyHex+createdAt], [owner+direction+delivered], owner',
        });
    }
}
export const db = new SecureChatDatabase();
//# sourceMappingURL=db.js.map