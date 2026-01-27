import { appD } from '@/model/app';
import { KeyPair, seedToKeyPair } from '@/utils/seedHelpers';
import { isNotNil, nthArg, pipe, prop } from 'ramda';
import { combine, sample } from 'effector';
import sodium from 'libsodium-wrappers-sumo';
import { API_URL } from '@/constants';
import { parseFetchResponse } from '@/lib/parseFetchResponse';
import { fromResult } from '@/lib/fromResult';

export interface StoredAccount {
    name: string;
    salt: string;
    nonce: string;
    encryptedSeed: string;
    publicKey: string;
}

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
export const updateUserName = appD.createEvent<string>();
export const signup = appD.createEvent<{ seed: string; name: string; password: string }>();
export const loginWithPassword = appD.createEvent<{ account: StoredAccount; password: string }>();

const loginFx = appD.createEffect((seed: string) => {
    return fromResult(seedToKeyPair(seed));
});

const loginWithPasswordFx = appD.createEffect(async ({ account, password }: { account: StoredAccount; password: string }) => {
    try {
        await sodium.ready;
        
        const salt = sodium.from_hex(account.salt);
        const key = sodium.crypto_pwhash(
            sodium.crypto_secretbox_KEYBYTES,
            password,
            salt,
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_DEFAULT
        );
        
        const seedBytes = sodium.crypto_secretbox_open_easy(
            sodium.from_hex(account.encryptedSeed),
            sodium.from_hex(account.nonce),
            key
        );
        const seed = new TextDecoder().decode(seedBytes);
        return { seed, name: account.name };
    } catch (e) {
        console.error('Login error:', e);
        throw new Error('Неверный пароль');
    }
});

const saveAccountFx = appD.createEffect(async ({ seed, name, password }: { seed: string; name: string; password: string }) => {
    try {
        console.log('Starting account encryption...');
        await sodium.ready;
        
        const pairResult = seedToKeyPair(seed);
        if (pairResult.isErr()) throw new Error('Неверная seed-фраза');
        const pair = pairResult.value;

        console.log('Deriving key from password...');
        const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
        const key = sodium.crypto_pwhash(
            sodium.crypto_secretbox_KEYBYTES,
            password,
            salt,
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_DEFAULT
        );

        console.log('Key derived, encrypting seed...');
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const encryptedSeed = sodium.crypto_secretbox_easy(
            new TextEncoder().encode(seed), 
            nonce, 
            key
        );
        
        const account: StoredAccount = {
            name,
            salt: sodium.to_hex(salt),
            nonce: sodium.to_hex(nonce),
            encryptedSeed: sodium.to_hex(encryptedSeed),
            publicKey: sodium.to_hex(pair.publicKey)
        };

        const savedAccounts: StoredAccount[] = JSON.parse(localStorage.getItem('securechat_accounts') || '[]');
        const filteredAccounts = savedAccounts.filter((a) => a.publicKey !== account.publicKey);
        filteredAccounts.push(account);
        localStorage.setItem('securechat_accounts', JSON.stringify(filteredAccounts));
        
        console.log('Account saved successfully.');
        return { seed, name, pair };
    } catch (e: any) {
        console.error('Signup error:', e);
        throw e;
    }
});

export const $userName = appD.createStore<string>('Vasya')
    .on(updateUserName, (_, name) => name)
    .on(saveAccountFx.doneData, (_, { name }) => name)
    .on(loginWithPasswordFx.doneData, (_, { name }) => name)
    .reset(logOut);

export const $seed = appD.createStore<string | null>(null)
    .on(loginFx.done, pipe(nthArg(1), prop('params')))
    .on(saveAccountFx.doneData, (_, { seed }) => seed)
    .on(loginWithPasswordFx.doneData, (_, { seed }) => seed)
    .reset(logOut);

export const $keyPair = appD.createStore<KeyPair | null>(null)
    .on(loginFx.doneData, nthArg(1))
    .on(saveAccountFx.doneData, (_, { pair }) => pair)
    .on(loginWithPasswordFx.doneData, (_, { seed }) => {
        const result = seedToKeyPair(seed);
        return result.isOk() ? result.value : null;
    })
    .reset(logOut);

export const $token = appD.createStore<string | null>(null)
    .on(authFx.doneData, pipe(nthArg(1), prop('token')))
    .reset(logOut);

export const $signupError = appD.createStore<string | null>(null)
    .on(saveAccountFx.failData, (_, error) => error.message)
    .on(signup, () => null)
    .reset(logOut);

export const $loginError = appD.createStore<string | null>(null)
    .on(loginWithPasswordFx.failData, (_, error) => error.message)
    .on(loginWithPassword, () => null)
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

sample({
    clock: signup,
    target: saveAccountFx
});

sample({
    clock: loginWithPassword,
    target: loginWithPasswordFx
});
