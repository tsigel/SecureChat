/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

type PushPayload = {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
};

const fallbackPayload: Required<Pick<PushPayload, 'title' | 'body' | 'data'>> = {
    title: 'Новое сообщение',
    body: 'У вас новое сообщение в SecureChat',
    data: {},
};

sw.addEventListener('install', () => {
    // Активируем SW сразу после установки
    void sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
    const e = event as ExtendableEvent;
    e.waitUntil(sw.clients.claim());
});

/**
 * Ожидаемый payload (пример):
 * {
 *   "title": "Новое сообщение",
 *   "body": "У вас новое зашифрованное сообщение",
 *   "data": { "conversationId": "...", "messageId": "...", "senderPk": "...", "createdAt": 0 }
 * }
 */
sw.addEventListener('push', (event) => {
    const e = event as PushEvent;
    let payload: PushPayload = fallbackPayload;

    try {
        const data = e.data?.json() as unknown;
        if (data && typeof data === 'object') {
            payload = data as PushPayload;
        }
    } catch {
        payload = fallbackPayload;
    }

    const title = payload.title || fallbackPayload.title;
    const options: NotificationOptions = {
        body: payload.body || fallbackPayload.body,
        icon: '/apple-icon.png',
        badge: '/icon-light-32x32.png',
        data: payload.data ?? fallbackPayload.data,
    };

    e.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener('notificationclick', (event) => {
    const e = event as NotificationEvent;
    e.notification.close();

    const data = (e.notification.data ?? {}) as Record<string, unknown>;

    const conversationId = typeof data.conversationId === 'string' ? data.conversationId : null;

    const targetUrl = conversationId
        ? `/app?conversationId=${encodeURIComponent(conversationId)}`
        : '/app';

    e.waitUntil(
        (async () => {
            const clientList = await sw.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            for (const client of clientList) {
                // WindowClient имеет focus()/postMessage()
                const win = client as WindowClient;
                const url = new URL(win.url);

                // Фокусируем только вкладку нашего origin
                if (url.origin === sw.location.origin) {
                    await win.focus();
                    try {
                        win.postMessage({
                            type: 'push-notification-click',
                            data,
                        });
                    } catch {
                        // ignore
                    }
                    return;
                }
            }

            await sw.clients.openWindow(targetUrl);
        })(),
    );
});

sw.addEventListener('notificationclose', () => {
    // no-op (на будущее: аналитика/метрики)
});
