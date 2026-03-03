/// <reference lib="webworker" />

import { ResultAsync } from 'neverthrow';

type ClientMatchError = {
    kind: 'client-match',
    error: any;
}

export const isUserActive = (root: ServiceWorkerGlobalScope): ResultAsync<boolean, ClientMatchError> =>
    ResultAsync.fromPromise(root.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }),
        (error): ClientMatchError => ({
            kind: 'client-match',
            error
        }))
        .map((clients) => {
            return clients.some(client => client.visibilityState === 'visible' && client.focused);
        });
