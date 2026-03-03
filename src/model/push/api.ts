import { api } from '@/lib/apiClient';

export type SubscribePushParams = {
    subscription: PushSubscriptionJSON;
};

// Отправка Web Push подписки в oblivion:
// backend ожидает стандартный Web Push subscription object в body,
// а userId берёт из access‑token (Authorization header, который
// проставляется interceptor'ами api‑клиента).
export async function subscribePush(params: SubscribePushParams): Promise<{ ok: true }> {
    const { subscription } = params;

    const { data } = await api.post<{ ok: true }>('/message/subscribe', subscription, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

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
