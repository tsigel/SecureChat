import { appD } from '@/model/app';
import { always, nthArg } from 'ramda';

export const open = appD.createEvent();
export const close = appD.createEvent();
export const setOpenState = appD.createEvent<boolean>();

export const $isOpen = appD.createStore(false)
    .on(open, always(true))
    .on(setOpenState, nthArg(1))
    .reset(close);