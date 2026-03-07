import { err, errAsync, ok, ResultAsync } from 'neverthrow';
import { CustomError, make } from '@/utils/error';
import { INIT_WORKER_MESSAGE } from '@/constants';
import { MessagePortAdapter } from '@/bus/MessagePortAdapter';
import { Bus } from '@tsigel/message-bus';
import { Events, MainBus } from '@/bus/types';


type CreateError =
    | CustomError<'no-service-worker', null>
    | CustomError<'register'>
    | CustomError<'no-notification', null>
    | CustomError<'service-worker-not-supported', null>;

type ActivateError =
    | CustomError<'activate-error'>
    | CustomError<'no-worker-controller', null>;

type RequestSubscriptionError =
    | CustomError<'permission-denied'>;

type RequestPermissionError =
    | CustomError<'request-permission'>;

export type InitializeResult = {
    bus: MainBus,
    worker: ServiceWorker;
    registration: ServiceWorkerRegistration;
    subscription: PushSubscription | null;
}

export type InitializeError =
    | CreateError | ActivateError | RequestSubscriptionError;

const requestSubscription = (registration: ServiceWorkerRegistration): ResultAsync<PushSubscription | null, RequestSubscriptionError> =>
    ResultAsync.fromPromise(registration.pushManager.getSubscription(), make('permission-denied'));

export const initialize = (): ResultAsync<InitializeResult, InitializeError> => {
    if (!canUseNotifications()) {
        return errAsync({ type: 'no-notification', error: null });
    }
    if (!canUsePush()) {
        return errAsync({ type: 'service-worker-not-supported', error: null });
    }

    console.log('Initialize service worker...');
    return createWorker()
        .andThen((registration) => waitWorkerReady()
            .map((worker) => ({ worker, registration })))
        .andThen(({ worker, registration }) =>
            requestSubscription(registration)
                .map((subscription) => ({ worker, registration, subscription }))
        ).map(({ worker, subscription, registration }) => {

            console.log('Worker activate successful!');

            const { port1, port2 } = new MessageChannel();

            port1.start();
            port1.addEventListener('message', console.log);

            const adapter = new MessagePortAdapter(port1);
            const bus: MainBus = new Bus(adapter);

            bus.registerRequestHandler('ping', (ts: number) => {
                console.log('Receive ping event from service worker');
                return ({ type: 'pong', ts });
            });

            bus.on('log', (...args) => {
                console.log(`Service worker log:`, ...args);
            });

            bus.on('ready', (state) => {
                console.log(`Service worker ready ${state}`);
            });

            worker.postMessage({ type: INIT_WORKER_MESSAGE }, [port2]);

            return { bus, worker, subscription, registration };
        });
};

const createWorker = (): ResultAsync<ServiceWorkerRegistration, CreateError> => {
    console.log('create worker...');
    if (!navigator.serviceWorker) {
        return errAsync({ type: 'no-service-worker', error: null });
    }

    return ResultAsync.fromPromise(
        navigator.serviceWorker
            .register('/sw.js', { scope: '/', type: 'module' }),
        make('register')
    );
};

function canUseNotifications(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
}

function canUsePush(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

const waitWorkerReady = (): ResultAsync<ServiceWorker, ActivateError> => {
    console.log('Waiting activate worker...');

    return ResultAsync.fromPromise(navigator.serviceWorker.ready, make('activate-error'))
        .andThen(() => {
            if (!navigator.serviceWorker.controller) {
                return err({ type: 'no-worker-controller', error: null } as const);
            }
            return ok(navigator.serviceWorker.controller);
        });
};

export const requestPermissions = (): ResultAsync<NotificationPermission, RequestPermissionError> => {
    return ResultAsync.fromPromise(Notification.requestPermission(), make('request-permission'));
};

export const initializeRequest = initialize();

