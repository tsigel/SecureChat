import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { InitializeError, initializeRequest, requestPermissions } from '@/bus/runtime/service';

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

export const EnablePushDialog = () => {
    const [isOpen, setOpen] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [initializeError, setInitializeError] = useState<InitializeError | null>(null);

    const onClickEnablePush = useCallback(() => {
        void requestPermissions()
            .andTee((permission) => {
                console.log(`Полученное разрешение: ${permission}`);
                setPermission(permission);
                if (permission === 'granted') {
                    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

                    navigator.serviceWorker.ready
                        .then((registration) =>
                            registration.pushManager.getSubscription()
                                .then((subscription) =>
                                        subscription ?? registration.pushManager.subscribe({
                                            userVisibleOnly: true,
                                            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as ArrayBuffer
                                        })
                                )
                        )
                        .then(subscription => {
                            const json = subscription.toJSON();
                        });
                }
            })
            .orTee((e) => {
                console.log(`Не удалось включить разрешение на отправку`, e);
            });
    }, []);

    useEffect(() => {
        initializeRequest
            .andTee((data) => {
                if (!data.subscription) {
                    setOpen(true);
                }
            })
            .orTee((data) => {
                console.error(`Unknown initialize error!`);
                setInitializeError(data);
            });
    }, []);

    const content = useMemo(() => {
        switch (permission) {
            case 'default':
                return <Fragment/>;
            case 'denied':
                return (
                    <p>
                        Вы запретили пуш уведомления. Разрешите уведомления в настройках браузера.
                    </p>
                );
            case 'granted':
                return (
                    <p>
                        Шикарно, выполняется подписка на уведомления...
                    </p>
                );
        }
    }, [permission]);

    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Для корректной работы мессенжера разрешите уведомления</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    {content}
                    <Button className={'mt-2 w-full'} onClick={onClickEnablePush}>
                        Включить уведомления
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
