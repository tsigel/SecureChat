import { errAsync, ResultAsync } from 'neverthrow';
import { always } from 'ramda';

export function registerServiceWorker(): ResultAsync<ServiceWorkerRegistration, null> {
    if (!('serviceWorker' in navigator)) {
        return errAsync(null);
    }

    return ResultAsync.fromPromise(
        navigator.serviceWorker.register('/sw.js', { scope: '/' }),
        always(null),
    );
}
