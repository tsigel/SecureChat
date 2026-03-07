import { errAsync, fromPromise } from 'neverthrow';
import { makeValidationError } from '@/storage/errors';
import { db } from './db';
import { UnknownError } from '@/error';
import { always, includes, pipe, prop } from 'ramda';
const formRecord = (record) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nameLower, ...rest } = record;
    return rest;
};
const toRecord = (contact) => {
    return { ...contact, nameLower: contact.name.toLowerCase() };
};
export class IndexedDbAddressBookRepository {
    upsertContact(contact) {
        if (!contact.id)
            return errAsync(makeValidationError('id is required'));
        if (!contact.name)
            return errAsync(makeValidationError('name is required'));
        if (!contact.owner)
            return errAsync(makeValidationError('owner is required'));
        return fromPromise(db.contacts.put(toRecord(contact)).then(() => contact), (error) => new UnknownError(error));
    }
    getContactByPublicKey(owner, publicKeyHex) {
        if (!owner)
            return errAsync(makeValidationError('owner is required'));
        if (!publicKeyHex)
            return errAsync(makeValidationError('publicKeyHex is required'));
        return fromPromise(db.contacts
            .where('[owner+id]')
            .equals([owner, publicKeyHex])
            .first()
            .then((record) => (record ? formRecord(record) : null)), (error) => new UnknownError(error));
    }
    listContacts(options) {
        const search = options.search?.trim().toLowerCase();
        const limit = options.limit;
        const owner = options.owner;
        return fromPromise((async () => {
            const records = await db.contacts
                .where('owner')
                .equals(owner)
                .limit(limit || 1000)
                .toArray();
            return records.map(formRecord).filter(pipe(prop('name'), includes(search ?? '')));
        })(), (error) => new UnknownError(error));
    }
    deleteContact(publicKeyHex, owner) {
        if (!publicKeyHex)
            return errAsync(makeValidationError('publicKeyHex is required'));
        if (!owner)
            return errAsync(makeValidationError('owner is required'));
        return fromPromise(db.contacts
            .where('[owner+id]')
            .equals([owner, publicKeyHex])
            .delete()
            .then(always(void 0)), (error) => new UnknownError(error));
    }
}
//# sourceMappingURL=IndexedDbAddressBookRepository.js.map