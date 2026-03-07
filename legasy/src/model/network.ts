import { appD } from '@/model/app';

export const setOnline = appD.createEvent<boolean>();

export const $isOnline = appD
    .createStore<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
    .on(setOnline, (_, v) => v);

let bound = false;

export function bindNetworkEvents() {
    if (bound) return;
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    bound = true;

    const update = () => setOnline(navigator.onLine);

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
}
