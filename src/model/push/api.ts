import { API_URL } from "@/constants";
import { parseFetchResponse } from "@/lib/parseFetchResponse";

export type SubscribePushParams = {
  token: string;
  userPk: string;
  subscription: PushSubscriptionJSON;
};

export async function subscribePush(params: SubscribePushParams): Promise<{ ok: true }> {
  const { token, userPk, subscription } = params;

  const response = await fetch(`${API_URL}/push/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userPk, subscription }),
  });

  return await parseFetchResponse(response);
}

export type UnsubscribePushParams = {
  token: string;
  userPk: string;
  subscription: PushSubscriptionJSON;
};

export async function unsubscribePush(params: UnsubscribePushParams): Promise<{ ok: true }> {
  const { token, userPk, subscription } = params;

  const response = await fetch(`${API_URL}/push/unsubscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userPk, subscription }),
  });

  return await parseFetchResponse(response);
}

