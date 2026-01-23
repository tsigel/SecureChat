import { appD } from '@/model/app';
import type { StoredMessage } from '@/storage';
import { MessageDirection } from '@/storage';
import { propEq } from 'ramda';
import { $selectedContact } from '@/model/contacts';
import { loadMessagesFx, markAsDeletedFromServerFx, markAsDeliveredFx, saveMessagesFx } from './storage';
import { mergeMessages } from './utils';

export const $messages = appD
    .createStore<StoredMessage[]>([])
    .on(loadMessagesFx.doneData, mergeMessages)
    .on(saveMessagesFx.doneData, mergeMessages)
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
            if (msg.direction === MessageDirection.Incoming && ids.includes(msg.id) && !msg.deletedFromServer) {
                msg.deletedFromServer = true;
                changed = true;
            }
        }

        return changed ? saved.slice() : saved;
    })
    .reset($selectedContact);

    // Watch for changes in $messages and log the updated messages
    $messages.watch((messages) => {
        console.log('Messages updated:', messages);
    });



