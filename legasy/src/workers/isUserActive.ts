/// <reference lib="webworker" />

import { ResultAsync } from 'neverthrow';
import { matchAll } from '@/workers/clients';

type ClientMatchError = {
    kind: 'client-match',
    error: any;
}

export const isUserActive = (root: ServiceWorkerGlobalScope): ResultAsync<boolean, ClientMatchError> =>
    matchAll(root, {
        type: 'window',
        includeUncontrolled: true // Обязательно для отладки
    }).map((clients) => {
        return clients.length > 0;
    });
