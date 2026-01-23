export type PublicKeyHex = string;
export type Base64 = string;

export type Stored<T extends Record<string, any>> = {
    owner: PublicKeyHex;
} & T;

export type Contact = {
    id: PublicKeyHex;
    name: string;
}

export type StoredContact = Stored<Contact>;

export type MessageBase<T = Base64> = {
    id: string;
    encrypted: T;
    createdAt: number;
}

export type IncomingMessage<T = Base64> = MessageBase<T> & {
    sender: PublicKeyHex;
    direction: MessageDirection.Incoming;
    readAt?: number;
    deletedFromServer: boolean;
};

export type OutgoingMessage<T = Base64> = MessageBase<T> & {
    direction: MessageDirection.Outgoing;
    recipient: PublicKeyHex;
    delivered: boolean;
}

export enum MessageDirection {
    Incoming = "incoming",
    Outgoing = "outgoing",
}

export type Message<T = Base64> = IncomingMessage<T> | OutgoingMessage<T>;

export type StoredMessage<T = Base64> = Stored<Message<T>>;
