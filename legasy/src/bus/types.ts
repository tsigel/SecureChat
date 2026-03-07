import { Bus } from '@tsigel/message-bus';

export type Events = {
    'ready': boolean,
    'log': any
};

type Common = {
    ping: (ts: number) => { type: 'pong', ts: number };
}

export type WorkerBus = Bus<Events, Common>;
export type MainBus = Bus<Events, Common>;
