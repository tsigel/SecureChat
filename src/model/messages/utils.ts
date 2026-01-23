import sodium from 'libsodium-wrappers';
import { indexBy, prop } from 'ramda';
import type { StoredMessage } from '@/storage';
import { MessageDirection } from '@/storage';

type ServerMessage = {
    sender: string;
    recipient: string;
    message: string;
    id: string;
    timestamp: number;
};

export function parseMessage(pk: string) {
    return (msg: ServerMessage): StoredMessage => {
        if (msg.recipient != pk) {
            throw new Error('Wrong recipient!');
        }

        return {
            id: msg.id,
            deletedFromServer: false,
            createdAt: msg.timestamp,
            encrypted: sodium.to_base64(sodium.from_hex(msg.message)),
            direction: MessageDirection.Incoming,
            owner: pk,
            sender: msg.sender,
        };
    };
}

export function mergeMessages(local: StoredMessage[], newest: StoredMessage[]): StoredMessage[] {
    const exist = indexBy(prop('id'), local);
    const diff = newest.filter((msg) => !exist[msg.id]);

    if (!diff.length) {
        return local;
    }

    return [...local, ...diff].sort((a, b) => a.createdAt - b.createdAt);
}

