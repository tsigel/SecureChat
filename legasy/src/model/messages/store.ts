import { appD } from '@/model/app';
import type { StoredMessage } from '@/storage';
import { MessageDirection } from '@/storage';
import { propEq } from 'ramda';
import { $selectedContact } from '@/model/contacts';
import {
    loadMessagesFx,
    markAsDeletedFromServerFx,
    markAsDeliveredFx,
    markAsReadFx,
    saveMessagesFx,
} from './storage';
import { mergeMessages } from './utils';
import { sample } from 'effector';

const mergeSavedMessagesForSelectedContact = appD.createEvent<StoredMessage[]>();

export const $messages = appD
    .createStore<StoredMessage[]>([])
    .on(loadMessagesFx.doneData, mergeMessages)
    .on(mergeSavedMessagesForSelectedContact, mergeMessages)
    .on(markAsDeliveredFx.done, (saved, { params: id }) => {
        const delivered = saved.find(propEq(id, 'id'));

        if (!delivered || delivered.direction !== MessageDirection.Outgoing) {
            return saved;
        }

        delivered.delivered = true;

        return saved.slice();
    })
    .on(markAsDeletedFromServerFx.doneData, (saved, ids) => {
        if (!ids.length) {
            return saved;
        }

        let changed = false;
        for (let i = 0; i < saved.length; i++) {
            const msg = saved[i];
            if (
                msg.direction === MessageDirection.Incoming &&
                ids.includes(msg.id) &&
                !msg.deletedFromServer
            ) {
                msg.deletedFromServer = true;
                changed = true;
            }
        }

        return changed ? saved.slice() : saved;
    })
    .on(markAsReadFx.done, (saved, { params: id }) => {
        const read = saved.find(propEq(id, 'id'));

        if (!read || read.direction !== MessageDirection.Incoming || read.readAt) {
            return saved;
        }

        read.readAt = Date.now();

        return saved.slice();
    })
    .reset($selectedContact);

// Мержим в стор только те сообщения, которые относятся к выбранному контакту.
sample({
    clock: saveMessagesFx.doneData,
    source: $selectedContact,
    filter: (contact) => !!contact,
    fn: (contact, saved) => {
        const contactId = contact!.id;
        return saved.filter((m) =>
            m.direction === MessageDirection.Incoming
                ? m.sender === contactId
                : m.recipient === contactId,
        );
    },
    target: mergeSavedMessagesForSelectedContact,
});
