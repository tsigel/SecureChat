import { blob, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Таблица сообщений
export const messages = sqliteTable('messages', {
    id: blob('id').primaryKey(),

    chatId: blob('chat_id').notNull(),

    sender: blob('sender_user_id').notNull(),

    createdAt: integer('created_at').notNull(),
    lamport: integer('lamport').notNull(),

    keyVersion: integer('key_version'),

    ciphertext: blob('ciphertext').notNull(),
    nonce: blob('nonce').notNull(),
}, (t) => ({
    chatLamportIdx: index('messages_chat_lamport_idx')
        .on(t.chatId, t.lamport, t.createdAt),
}));

// Таблица контактов
export const users = sqliteTable('users', {
    id: blob('id').primaryKey(),
    name: text('name'),
    avatarKey: text('avatar_key'),
    createdAt: integer('created_at').notNull(),
});

// Таблица ссылок аттачей
export const messageAttachments = sqliteTable('message_attachments', {
    messageId: blob('message_id').notNull(),
    attachmentId: blob('attachment_id').notNull(),

    order: integer('order').notNull(),
}, (t) => ({
    pk: primaryKey({
        columns: [t.messageId, t.order]
    }),
    attachmentIdx: index('msg_attach_attachment_idx').on(t.attachmentId)
}));

export const chats = sqliteTable('chats', {
    id: blob('id').primaryKey(),

    type: text('type', {
        enum: ['direct', 'group']
    }).notNull(),

    createdAt: integer('created_at').notNull(),

    title: text('title'),

    lastMessageId: blob('last_message_id'),
    lastMessageAt: integer('last_message_at'),
}, (t) => ({
    lastMessageIdx: index('chats_last_message_idx')
        .on(t.lastMessageAt)
}));

export const chatMembers = sqliteTable('chat_members', {
    chatId: blob('chat_id').notNull(),
    userId: blob('user_id').notNull(),

    role: text('role', {
        enum: ['member', 'owner', 'admin']
    }).notNull(),

    joinedAt: integer('joined_at').notNull(),
}, (t) => ({
    pk: primaryKey({
        columns: [t.chatId, t.userId],
    }),

    userIdx: index('chat_members_user_idx')
        .on(t.userId),
}));

export const chatKeys = sqliteTable('chat_keys', {
    chatId: blob('chat_id').notNull(),
    version: integer('version').notNull(),
    key: blob('key').notNull(),
    createdAt: integer('created_at').notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.chatId, t.version] }),
    chatIdx: index('chat_keys_chat_idx')
        .on(t.chatId)
}));

export const attachments = sqliteTable('attachments', {
    id: blob('id').primaryKey(), // hash

    objectKey: text('object_key').notNull().unique(),

    type: text('type', {
        enum: ['image', 'video', 'audio', 'file']
    }).notNull(),

    mime: text('mime').notNull(),

    filename: text('filename'),

    size: integer('size').notNull(),

    width: integer('width'),
    height: integer('height'),

    duration: integer('duration'),
    previewKey: text('preview_key'),
});

type Hash = string;
type U64 = number;
type Bytes = Uint8Array;

type AttachmentRef = {
    id: Hash;
    size: number;
    mime: string;
}

type  Envelope = {
    id: Hash

    chatId: Hash

    senderUserId: Hash
    senderDeviceId: Hash

    createdAt: U64
    lamport: U64

    ciphertext: Bytes
    nonce: Bytes

    attachments: AttachmentRef[]

    protocolVersion: 1
}
