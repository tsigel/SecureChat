import { pack } from 'msgpackr';
import { appD } from '@/model/app';
import { API_URL } from '@/constants';
import { parseFetchResponse } from '@/lib/parseFetchResponse';
import type { IncomingMessage, OutgoingMessage, Stored, StoredMessage } from '@/storage';
import { MessageDirection } from '@/storage';
import { map, prop } from 'ramda';
import sodium from 'libsodium-wrappers';
import { parseMessage } from './utils';

export type FetchMessagesProps = {
    token: string;
    pk: string;
};

export const fetchMessagesFx = appD.createEffect(({ token, pk }: FetchMessagesProps) => {
    return fetch(`${API_URL}/user/messages`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then<ServerMessage[]>(parseFetchResponse)
        .then(map(parseMessage(pk)));
});

export type SendMessageFxProps = {
    message: Omit<Stored<OutgoingMessage>, 'id'>;
    token: string;
};

export const sendMessageFx = appD.createEffect(({ token, message }: SendMessageFxProps) => {
    if (message.direction !== MessageDirection.Outgoing) {
        throw new Error('Only outgoing messages can be sent');
    }

    const body = pack({
        sender: message.owner,
        recipient: message.recipient,
        message: sodium.from_base64(message.encrypted),
    });

    return fetch(`${API_URL}/message`, {
        headers: {
            'Content-Type': 'application/octet-stream',
            Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: body as BodyInit,
    }).then<{ ok: true; id: string }>(parseFetchResponse);
});

export type SendDeliveredProps = {
    token: string;
    messages: Stored<IncomingMessage>[];
};

export type SendDeliveredResult = {
    success: boolean;
    messageId: string;
};

export const sendDeliveredFx = appD.createEffect(async (data: SendDeliveredProps) => {
    const response = await fetch(`${API_URL}/message/read`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.messages.map(prop('id'))),
    });

    return await parseFetchResponse(response);
});

type ServerMessage = {
    sender: string;
    recipient: string;
    message: string;
    id: string;
    timestamp: number;
};

sendDeliveredFx.watch((params) => {
    console.log('sendDeliveredFx called with params:', params);
});

sendDeliveredFx.done.watch((result) => {
    console.log('sendDeliveredFx done:', result);
});

sendDeliveredFx.fail.watch((result) => {
    console.error('sendDeliveredFx fail:', result);
});

sendDeliveredFx.finally.watch((result) => {
    console.log('sendDeliveredFx finally:', result);
});

