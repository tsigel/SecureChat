import { appD } from '@/model/app';
import { subscribePush, unsubscribePush } from './api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function canUseNotifications(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
}

function canUsePush(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export const refreshNotificationPermission = appD.createEvent();

export const requestNotificationPermissionFx = appD.createEffect(async () => {
    if (!canUseNotifications()) {
        return 'denied' as NotificationPermission;
    }
    return await Notification.requestPermission();
});

export const getNotificationPermissionFx = appD.createEffect(async () => {
    if (!canUseNotifications()) {
        return 'denied' as NotificationPermission;
    }
    return Notification.permission;
});

export const $notificationPermission = appD
    .createStore<NotificationPermission>('default')
    .on(getNotificationPermissionFx.doneData, (_, permission) => permission)
    .on(requestNotificationPermissionFx.doneData, (_, permission) => permission)
    .on(refreshNotificationPermission, (state) => state);

export const ensurePushSubscriptionFx = appD.createEffect(
    async (params: { token: string; userPk: string }) => {
        if (!canUsePush()) {
            throw new Error('Push API не поддерживается в этом браузере');
        }

        if (!canUseNotifications() || Notification.permission !== 'granted') {
            throw new Error('Нет разрешения на уведомления');
        }

        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

        if (!vapidPublicKey) {
            throw new Error('Не задан VITE_VAPID_PUBLIC_KEY');
        }

        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();

        const subscription =
            existing ??
            (await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            }));

        const subscriptionJson = subscription.toJSON();

        await subscribePush({
            token: params.token,
            userPk: params.userPk,
            subscription: subscriptionJson,
        });

        return subscriptionJson;
    },
);

export const unsubscribeFromPushFx = appD.createEffect(
    async (params: { token: string; userPk: string }) => {
        if (!canUsePush()) {
            return null;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            return null;
        }

        const subscriptionJson = subscription.toJSON();

        // сначала пробуем сообщить backend, потом отписываемся локально
        await unsubscribePush({
            token: params.token,
            userPk: params.userPk,
            subscription: subscriptionJson,
        });

        await subscription.unsubscribe();
        return null;
    },
);

export const $pushSubscription = appD
    .createStore<PushSubscriptionJSON | null>(null)
    .on(ensurePushSubscriptionFx.doneData, (_, sub) => sub)
    .on(unsubscribeFromPushFx.doneData, () => null);
