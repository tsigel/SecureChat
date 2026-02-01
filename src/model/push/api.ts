import { api } from '@/lib/apiClient';

export type SubscribePushParams = {
    token: string;
    userPk: string;
    subscription: PushSubscriptionJSON;
};

export async function subscribePush(params: SubscribePushParams): Promise<{ ok: true }> {
    const { token, userPk, subscription } = params;

    const { data } = await api.post<{ ok: true }>(
        '/push/subscribe',
        { userPk, subscription },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        },
    );

    return data;
}

export type UnsubscribePushParams = {
    token: string;
    userPk: string;
    subscription: PushSubscriptionJSON;
};

export async function unsubscribePush(params: UnsubscribePushParams): Promise<{ ok: true }> {
    const { token, userPk, subscription } = params;

    const { data } = await api.post<{ ok: true }>(
        '/push/unsubscribe',
        { userPk, subscription },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        },
    );

    return data;
}
