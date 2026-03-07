import { CustomError } from '@/workers/types';
import { ResultAsync } from 'neverthrow';

type ShowNotificationError = CustomError<'show-notification'>;

export const showNotification = (
    sw: ServiceWorkerGlobalScope,
    title: string,
    options?: NotificationOptions
): ResultAsync<void, ShowNotificationError> =>
    ResultAsync
        .fromPromise(
            sw.registration.showNotification(title, options),
            (error): ShowNotificationError => ({ type: 'show-notification', error })
        );
