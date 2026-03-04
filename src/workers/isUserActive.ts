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
        // Логируем для отладки, что видит воркер
        console.log(`[SW] Found ${clients.length} clients:`,
            clients.map(c => ({ url: c.url, state: c.visibilityState, focused: c.focused }))
        );
        // Если есть хоть одна видимая вкладка (даже если фокус на консоли)
        return clients.some(client => client.visibilityState === 'visible');
    });
