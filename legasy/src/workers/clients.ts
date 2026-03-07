import { ResultAsync } from 'neverthrow';

type ClientMatchError = {
    kind: 'client-match',
    error: any;
}

export const matchAll = <T extends ClientQueryOptions>(root: ServiceWorkerGlobalScope, options?: T): MatchReturn<T> => {
    return ResultAsync.fromPromise(
        root.clients.matchAll(options),
        (error) => ({
            kind: 'client-match',
            error
        }));
};

type MatchReturn<T extends ClientQueryOptions> = ResultAsync<ReadonlyArray<T['type'] extends 'window' ? WindowClient : Client>, ClientMatchError>;
