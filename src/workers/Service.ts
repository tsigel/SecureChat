/// <reference lib="webworker" />
import { okAsync, ResultAsync } from 'neverthrow';
import { isUserActive } from '@/workers/isUserActive';
import { showNotification } from '@/workers/showNotification';
import { always } from 'ramda';
import { WebStorage } from '@/storage';
import { pushMessageJson } from '@/workers/jsonParse';
import { validate } from '@/utils/validate';
import zod from 'zod';

const pushSchema = zod.object({
    sender: zod.string(),
    subscriber: zod.string()
});

export class Service {
    private readonly sw: ServiceWorkerGlobalScope;
    private readonly storage: WebStorage;

    constructor(sw: ServiceWorkerGlobalScope) {
        this.sw = sw;
        this.storage = new WebStorage();

        void this.storage.init();
        this.setHandlers();
    }

    private setHandlers(): void {
        const sw = this.sw;

        sw.addEventListener('install', () => {
            void sw.skipWaiting();
        });

        sw.addEventListener('activate', (event) => {
            const e = event as ExtendableEvent;
            e.waitUntil(sw.clients.claim());
        });

        sw.addEventListener('push', (event) => {
            console.log('Receive push!', event);
            const task = isUserActive(sw)
                .andThen((active) => {
                    if (active || !event.data) {
                        console.log('No active tabs or no data', active, event.data);
                        return okAsync(void 0);
                    }

                    return pushMessageJson(event.data)
                        .andThen((data) => validate(pushSchema, data))
                        .asyncAndThen((payload) => {
                            return this.storage.contacts
                                .getContactByPublicKey(payload.subscriber, payload.sender)
                                .map((contact) => ({ contact, payload }));
                        })
                        .andThen(({ contact, payload }) => {
                            const title = contact
                                ? `Новое сообщение от ${contact.name}`
                                : `Новое сообщение от ${payload.sender}`;

                            return showNotification(sw, title, {
                                tag: `${payload.subscriber}-${payload.sender}`,
                                data: {
                                    sender: payload.sender,
                                    subscriber: payload.subscriber,
                                },
                                // TODO: icon
                            });
                        })
                        .orTee((e) => {
                            console.error(`Some error in push flow`, e);
                        });
                });

            event.waitUntil(task.match(always(void 0), always(void 0)));
        });

        sw.addEventListener('notificationclick', (event) => {
            const e = event as NotificationEvent;
            e.notification.close();

            const rawData = e.notification.data as unknown;
            const data =
                rawData && typeof rawData === 'object'
                    ? (rawData as Record<string, unknown>)
                    : {};

            const contactId = typeof data.sender === 'string' ? data.sender : null;

            const targetUrl = contactId
                ? `/app/chat/${encodeURIComponent(contactId)}`
                : '/app';

            const task = ResultAsync.fromPromise(
                (async () => {
                    const clients = await sw.clients.matchAll({
                        type: 'window',
                        includeUncontrolled: true,
                    });

                    for (const client of clients) {
                        const win = client as WindowClient;
                        let url: URL;

                        try {
                            url = new URL(win.url);
                        } catch {
                            continue;
                        }

                        if (url.origin !== sw.location.origin) {
                            continue;
                        }

                        await win.focus();

                        try {
                            win.postMessage({
                                type: 'push-notification-click',
                                contactId,
                            });
                        } catch {
                            // ignore postMessage errors
                        }

                        return;
                    }

                    await sw.clients.openWindow(targetUrl);
                })(),
                always<null>(null),
            );

            e.waitUntil(task.match(always(void 0), always(void 0)));
        });
    }
}
