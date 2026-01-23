import { errAsync, fromPromise, ResultAsync } from 'neverthrow';

import type { AddressBookRepository, ListContactsOptions } from '@/storage/facade';
import type { StorageError } from '@/storage/errors';
import { makeValidationError } from '@/storage/errors';
import type { PublicKeyHex, StoredContact } from '@/storage/types';
import { db } from './db';
import { UnknownError } from '@/error';
import { always, includes, pipe, prop } from 'ramda';

type ContactRecord = StoredContact & { nameLower: string };

const formRecord = (record: ContactRecord): StoredContact => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nameLower, ...rest } = record;
  return rest;
};

const toRecord = (contact: StoredContact): ContactRecord => {
  return { ...contact, nameLower: contact.name.toLowerCase() };
};

export class IndexedDbAddressBookRepository implements AddressBookRepository {

  public upsertContact(contact: StoredContact): ResultAsync<StoredContact, StorageError> {
    if (!contact.id) return errAsync(makeValidationError('id is required'));
    if (!contact.name) return errAsync(makeValidationError('name is required'));
    if (!contact.owner) return errAsync(makeValidationError('owner is required'));

    return fromPromise(
      db.contacts.put(toRecord(contact)).then(() => contact),
      (error) => new UnknownError(error)
    );
  }

  public getContactByPublicKey(publicKeyHex: PublicKeyHex): ResultAsync<StoredContact | null, StorageError> {
    if (!publicKeyHex) return errAsync(makeValidationError('publicKeyHex is required'));

    return fromPromise(
      db.contacts.get(publicKeyHex).then((record) => record ? formRecord(record) : null),
      (error) => new UnknownError(error)
    );
  }

  public listContacts(options: ListContactsOptions): ResultAsync<StoredContact[], StorageError> {
    const search = options.search?.trim().toLowerCase();
    const limit = options.limit;
    const owner = options.owner;

    return fromPromise(
      (async () => {
        const records = await db.contacts
          .where('owner')
          .equals(owner)
          .limit(limit || 1_000)
          .toArray();

        return records.map(formRecord)
          .filter(pipe(prop('name'), includes(search ?? '')));
      })(),
      (error) => new UnknownError(error)
    );
  }

  public deleteContact(publicKeyHex: PublicKeyHex, userPublicKeyHex: PublicKeyHex): ResultAsync<void, StorageError> {
    if (!publicKeyHex) return errAsync(makeValidationError('publicKeyHex is required'));
    if (!userPublicKeyHex) return errAsync(makeValidationError('userPublicKeyHex is required'));

    return fromPromise(
      db.contacts.delete(publicKeyHex).then(always(void 0)),
      (error) => new UnknownError(error)
    );
  }
}
