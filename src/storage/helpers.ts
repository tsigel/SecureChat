import { IncomingMessage, OutgoingMessage, PublicKeyHex, Stored } from '@/storage/types';
import { MessageRepository } from '@/storage/facade';
import { head } from 'ramda';

export const addMessage = <T extends IncomingMessage | OutgoingMessage>(message: T, pk: PublicKeyHex, repo: MessageRepository) => {
    return repo.addMessages([{ ...message, owner: pk }]).map<Stored<T>>(head);
};
