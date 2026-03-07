export interface Envelope<T extends string, P> {
    type: T;
    payload: P;
}

export type Version<V extends number> = {
    version: V;
}
