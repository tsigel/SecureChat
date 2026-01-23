import { appD } from '@/model/app';
import { KeyPair, seedToKeyPair } from '@/utils/seedHelpers';
import { isNotNil, nthArg, pipe, prop } from 'ramda';
import { combine, sample } from 'effector';
import sodium from 'libsodium-wrappers';
import { API_URL } from '@/constants';
import { parseFetchResponse } from '@/lib/parseFetchResponse';
import { fromResult } from '@/lib/fromResult';

const SIGN_PREFIX = 'login:';

export const authFx = appD.createEffect(async (pair: KeyPair) => {
    await sodium.ready;

    const timestamp = Date.now();
    const message = new TextEncoder().encode(`${SIGN_PREFIX}${timestamp}`);
    const signature = sodium.crypto_sign_detached(message, pair.privateKey);

    return fetch(`${API_URL}/auth`, {
        body: JSON.stringify({
            publicKey: sodium.to_hex(pair.publicKey),
            signature: sodium.to_hex(signature),
            timestamp
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then<{ ok: boolean; token: string }>(parseFetchResponse);
});

export const logOut = appD.createEvent();
export const login = appD.createEvent<string>();

const loginFx = appD.createEffect((seed: string) => {
    return fromResult(seedToKeyPair(seed));
});

export const $seed = appD.createStore<string | null>(null)
    .on(loginFx.done, pipe(nthArg(1), prop('params')))
    .reset(logOut);

export const $keyPair = appD.createStore<KeyPair | null>(null)
    .on(loginFx.doneData, nthArg(1))
    .reset(logOut);

export const $token = appD.createStore<string | null>(null)
    .on(authFx.doneData, pipe(nthArg(1), prop('token')))
    .reset(logOut);

export const $hasUser = combine($keyPair, Boolean);

export const $pk = combine(
    $keyPair,
    (keyPair) =>
        keyPair
            ? sodium.to_hex(keyPair.publicKey)
            : null
);

sample({
    clock: $keyPair,
    filter: isNotNil,
    target: authFx
});

sample({
    clock: login,
    target: loginFx
});
