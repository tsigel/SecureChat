import { appD } from '@/model/app';
import { StorageFacade, WebStorage } from '@/storage';

const storage = new WebStorage();
storage.init();

export const $storage = appD.createStore<StorageFacade>(storage);
export const $messages = appD.createStore(storage.messages);
export const $contacts = appD.createStore(storage.contacts);
