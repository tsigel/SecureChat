import { WorkerBus } from '@/bus/types';
import { INIT_WORKER_MESSAGE } from '@/constants';
import { MessagePortAdapter } from '@/bus/MessagePortAdapter';
import { Bus } from '@tsigel/message-bus';

export class PageManager {
    private readonly sw: ServiceWorkerGlobalScope;
    private readonly pages: Record<string, WorkerBus> = Object.create(null);

    constructor(sw: ServiceWorkerGlobalScope) {
        this.sw = sw;

        this.setHandlers();
        this.launchCheckLivePortsInterval();
    }

    public length(): number {
        this.checkPorts();
        return Object.keys(this.pages).length;
    }

    public log(data: any): void {
        Object.entries(this.pages).forEach(([id, bus]) => {
            try {
                bus.dispatchEvent('log', data);
            } catch (e) {
                console.log('Page was deleted!');
                bus.destroy();
                delete this.pages[id];
            }
        });
        console.log(data);
    }

    private setHandlers(): void {
        const sw = this.sw;

        const handler = (event: ExtendableMessageEvent) => {
            if (event.data && event.data.type === INIT_WORKER_MESSAGE) {
                const port = event.ports[0];
                port.start();

                const adapter = new MessagePortAdapter(port);
                const bus: WorkerBus = new Bus(adapter);

                const id = (event.source as Client).id;

                this.pages[id] = bus;

                bus.dispatchEvent('ready', true);
                console.log(`Send ready for ${id}`);
            }
        };

        sw.addEventListener('message', handler);
    }

    private launchCheckLivePortsInterval() {
        setInterval(() => {
            console.log('Launch check clients interval...');
            this.checkPorts();
        }, 10_000);
    }

    private checkPorts() {
        const time = Date.now();
        Object.entries(this.pages).forEach(([id, bus]) => {
            const onError = (e: unknown) => {
                console.error(`Failed check window!`, e);
                bus.destroy();
                delete this.pages[id];
            };
            try {
                console.log(`Request ping for client ${id}...`);
                bus.request('ping', time)
                    .then(({ ts }) => {
                        if (ts !== time) {
                            onError(new Error('Wrong time in payload'));
                        }
                        console.log(`Client ${id} active.`);
                    })
                    .catch(onError);
            } catch (e) {
                onError(e);
            }
        });
    }
}
