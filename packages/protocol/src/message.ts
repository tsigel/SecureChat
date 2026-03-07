import { Envelope, Version } from './core.js';
import { AttachmentId, ChatId, MessageId, PublicKey } from './ids.js';

export enum ChatType {
    Direct = 'direct',
    Group = 'group'
};

export type MessagePropsV1<Bytes = Uint8Array> = Version<1> & {

    /**
     * hash(payloadWithoutId)
     */
    id: MessageId<Bytes>;

    /**
     * чат
     */
    chatId: ChatId<Bytes>;

    /**
     * отправитель
     */
    sender: PublicKey<Bytes>;

    /**
     * lamport clock
     */
    lamport: number;

    /**
     * время клиента
     */
    createdAt: number;

    /**
     * ciphertext
     */
    ciphertext: Bytes;

    /**
     * nonce
     */
    nonce: Bytes;

    /**
     * attachments ids (hash)
     */
    attachments?: AttachmentId<Bytes>[];

    /**
     * ed25519(signature(id))
     */
    signature: Bytes;
}

export type MessageGroupPropsV1 = MessagePropsV1 & {
    chatType: ChatType.Group,
    keyVersion: number;
}

export type MessageDirectPropsV1 = MessagePropsV1 & {
    chatType: ChatType.Direct,
}

export type MessageDeliveredPropsV1<Bytes = Uint8Array> = Version<1> & {
    messageId: MessageId<Bytes>;
}

export type SendMessageEventV1 = Envelope<'send_message', MessageGroupPropsV1 | MessageDirectPropsV1>;
export type MessageDeliveredEventV1 = Envelope<'message_delivered', MessageDeliveredPropsV1>;
