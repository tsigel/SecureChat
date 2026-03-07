import { Adapter, IOneArgFunction, TMessageContent } from '@tsigel/message-bus';

export class MessagePortAdapter extends Adapter {
    private readonly port: MessagePort;
    private handler: IOneArgFunction<MessageEvent<any>, void> | null = null;

    constructor(port: MessagePort) {
        super();
        this.port = port;
    }

    public addListener(cb: IOneArgFunction<TMessageContent, void>): this {
        if (this.handler) {
            throw new Error('Handler already exist!');
        }

        this.handler = (event) => {
            cb(event.data);
        };
        this.port.addEventListener('message', this.handler);
        return this;
    }

    public send(data: TMessageContent): this {
        this.port.postMessage(data);
        return this;
    }

    public destroy() {
        if (this.handler) {
            this.port.removeEventListener('message', this.handler);
        }
    }
}
