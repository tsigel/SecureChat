import { ArrayEntry } from '../../types/utils';

export module 'ramda' {

    export function head<T>(list: Array<T>): T | undefined;
    export function always<T>(data: T): () => T;

}