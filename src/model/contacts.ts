import { appD } from '@/model/app';
import { Contact } from '@/components/messenger/types';
import { $keyPair, $pk, logOut } from '@/model/user';
import { StorageFacade, StoredContact, StoredMessage } from '@/storage';
import asyncMap from '@tsigel/async-map';
import { nthArg, pipe, propEq } from 'ramda';
import { createGate } from 'effector-react';
import { sample } from 'effector';
import { $storage } from '@/model/storage';
import sodium, { KeyPair } from 'libsodium-wrappers';
import { decodeText, decrypt } from '@/lib/crypto';
import { fromAsyncResult } from '@/lib/fromResult';
import { once } from 'patronum';


export const addOrRenameContact = appD.createEvent<StoredContact>();
export const selectContact = appD.createEvent<string>();
export const setSearch = appD.createEvent<string | null>();
export const deleteContact = appD.createEvent<string>();
export const refreshContactsMeta = appD.createEvent<string[]>(); // contact ids

export const ContactsGate = createGate({
    domain: appD,
    name: 'ContactsGate'
});

type LoadContactsParams = {
    storage: StorageFacade;
    owner: string;
    keyPair: KeyPair;
}

type ContactMeta = { id: string; lastMessage?: string; timestamp?: number; unread?: number };

type RefreshContactsMetaParams = {
    ids: string[];
    storage: StorageFacade;
    owner: string;
    keyPair: KeyPair;
};

const refreshContactsMetaFx = appD.createEffect<RefreshContactsMetaParams, ContactMeta[]>(async ({
    ids,
    storage,
    owner,
    keyPair,
}) => {
    const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
    if (!uniqueIds.length) {
        return [];
    }

    const metas = await asyncMap(5, async (contactId): Promise<ContactMeta | null> => {
        try {
            const result = await storage.messages.loadMessages({
                publicKeyHex: contactId,
                owner
            });
            if (result.isErr()) {
                throw result.error;
            }

            return {
                id: contactId,
                unread: getUnreadCount(result.value),
                ...getLastMessage(result.value, keyPair)
            };
        } catch (error) {
            console.error('[contacts] refreshContactsMetaFx error', { contactId, error });
            return null;
        }
    }, uniqueIds);

    return metas.filter((m): m is ContactMeta => !!m);
});

const loadContactsFx = appD.createEffect<LoadContactsParams, Contact[]>(async ({
    storage,
    owner,
    keyPair,
}) => {
    const result = await storage.contacts.listContacts({ owner });
    if (result.isErr()) {
        throw result.error;
    }
    const contacts = await asyncMap(5, (contact) => {
        return storage.messages.loadMessages({
            publicKeyHex: contact.id,
            owner
        }).then((result): Promise<never> | Contact => {
            if (result.isErr()) {
                return Promise.reject(result.error);
            }

            return {
                id: contact.id,
                name: contact.name,
                online: false,
                unread: getUnreadCount(result.value),
                ...getLastMessage(result.value, keyPair)
            } as Contact;
        });
    }, result.value);
    return contacts as Contact[];
});

type DeleteContactProps = {
    storage: StorageFacade,
    contactId: string;
    owner: string;
}

const deleteContactFx = appD.createEffect(({ storage, contactId, owner }: DeleteContactProps) => {
    return fromAsyncResult(storage.contacts.deleteContact(contactId, owner));
});

type AddContactProps = {
    contact: StoredContact,
    storage: StorageFacade
};

const addContactFx = appD.createEffect(({ contact, storage }: AddContactProps) => {
    return fromAsyncResult(storage.contacts.upsertContact(contact));
});

export const $contacts = appD.createStore<Contact[]>([])
    .on(loadContactsFx.doneData, pipe(nthArg(1), orderContacts))
    .on(refreshContactsMetaFx.doneData, (contacts, metas) => {
        if (!metas.length) {
            return contacts;
        }

        const metaById = new Map(metas.map((m) => [m.id, m] as const));
        let changed = false;

        const next = contacts.map((c) => {
            const meta = metaById.get(c.id);
            if (!meta) return c;
            changed = true;
            const { id: _id, ...rest } = meta;
            return { ...c, ...rest };
        });

        return changed ? orderContacts(next) : contacts;
    })
    .reset(logOut);

export const $selectedContact = appD.createStore<Contact | null>(null)
    .on(deleteContact, (selected, publicKeyHex) =>
        selected?.id === publicKeyHex ? null : selected
    )
    .on(refreshContactsMetaFx.doneData, (selected, metas) => {
        if (!selected || !metas.length) {
            return selected;
        }
        const meta = metas.find((m) => m.id === selected.id);
        if (!meta) {
            return selected;
        }
        const { id: _id, ...rest } = meta;
        return { ...selected, ...rest };
    })
    .reset(logOut);

export const $search = appD.createStore<string | null>(null)
    .on(setSearch, (_, value) => value)
    .reset(logOut);

sample({
    clock: addContactFx.doneData,
    source: $selectedContact,
    filter: (selectedContact) => !selectedContact,
    fn: (_, contact) => contact,
    target: $selectedContact
});

sample({
    clock: [ContactsGate.open, addContactFx.doneData, deleteContactFx.doneData],
    source: {
        storage: $storage,
        keyPair: $keyPair,
        owner: $pk
    },
    filter: (data): data is LoadContactsParams => data.owner != null,
    target: loadContactsFx
});

sample({
    clock: addOrRenameContact,
    source: $storage,
    fn: (storage, contact): AddContactProps => ({ storage, contact }),
    target: addContactFx
});

sample({
    clock: deleteContact,
    source: { storage: $storage, owner: $pk },
    filter: (source) => !!source.owner,
    fn: (source, contactId): DeleteContactProps => ({ ...source, contactId }) as DeleteContactProps,
    target: deleteContactFx
});

sample({
    clock: selectContact,
    source: $contacts,
    fn: (contacts, id) => contacts.find(propEq(id, 'id')) || null,
    target: $selectedContact
});

sample({
    clock: refreshContactsMeta,
    source: {
        storage: $storage,
        keyPair: $keyPair,
        owner: $pk
    },
    filter: (source, ids): source is { storage: StorageFacade; keyPair: KeyPair; owner: string } =>
        !!source.owner && !!source.keyPair && ids.length > 0,
    fn: (source, ids): RefreshContactsMetaParams => ({
        ids,
        storage: source.storage,
        owner: source.owner,
        keyPair: source.keyPair
    }),
    target: refreshContactsMetaFx
});

// Debug logging: добавление контакта и ошибки эффектов
addOrRenameContact.watch((contact) => {
    console.log('[contacts] addOrRenameContact', contact);
});

addContactFx.watch((params) => {
    console.log('[contacts] addContactFx.start', params);
});

addContactFx.done.watch(({ params, result }) => {
    console.log('[contacts] addContactFx.done', { params, result });
});

addContactFx.failData.watch((error) => {
    console.error('[contacts] addContactFx.fail', error);
});

loadContactsFx.watch((params) => {
    console.log('[contacts] loadContactsFx.start', params);
});

loadContactsFx.done.watch(({ params, result }) => {
    console.log('[contacts] loadContactsFx.done', { params, result });
});

loadContactsFx.failData.watch((error) => {
    console.error('[contacts] loadContactsFx.fail', error);
});

deleteContactFx.watch((params) => {
    console.log('[contacts] deleteContactFx.start', params);
});

deleteContactFx.done.watch(({ params, result }) => {
    console.log('[contacts] deleteContactFx.done', { params, result });
});

deleteContactFx.failData.watch((error) => {
    console.error('[contacts] deleteContactFx.fail', error);
});

sample({
    clock: once({
        source: loadContactsFx.done,
        reset: logOut
    }),
    source: { contacts: $contacts, selected: $selectedContact },
    fn: ({ contacts, selected }) => {
        if (selected || !contacts.length) {
            return selected;
        }
        return contacts[0];
    },
    target: $selectedContact
});

function getUnreadCount(messages: StoredMessage[]): number {
    let unread = 0;

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.direction === 'incoming' && message.readAt) {
            break;
        } else if (message.direction === 'incoming') {
            unread++;
        }
    }

    return unread;
}

function getLastMessage(messages: StoredMessage[], userKeyPair: KeyPair): { lastMessage?: string, timestamp?: number } {
    const lastStoredMessage = messages.at(0);

    if (!lastStoredMessage) {
        return {};
    }

    const peerPublicKeyHex = lastStoredMessage.direction === 'incoming'
        ? lastStoredMessage.sender
        : lastStoredMessage.recipient;

    return {
        lastMessage: decodeText(
            decrypt(
                lastStoredMessage.encrypted,
                sodium.from_hex(peerPublicKeyHex),
                userKeyPair
            )),
        timestamp: lastStoredMessage.createdAt
    };
}

function orderContacts(contacts: Contact[]): Contact[] {
    return contacts.sort((a, b) => {
        // Сначала сортируем по дате последнего сообщения (более свежие выше)
        const timestampA = a.timestamp ?? 0;
        const timestampB = b.timestamp ?? 0;

        if (timestampA !== timestampB) {
            return timestampB - timestampA; // Более свежие сообщения идут первыми
        }

        // Если даты одинаковые или отсутствуют, сортируем по алфавиту
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}
