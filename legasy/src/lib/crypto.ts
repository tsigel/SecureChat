import sodium from 'libsodium-wrappers';
import type { KeyPair } from '@/utils/seedHelpers';

/**
 * Расшифровывает сообщение от отправителя для получателя
 * @param encrypted - Зашифрованное сообщение в hex формате
 * @param senderPublicKey
 * @param recipient - Ключевая пара получателя
 * @returns Расшифрованные данные в виде Uint8Array
 */
export const decrypt = (
    encrypted: string,
    senderPublicKey: Uint8Array,
    recipient: KeyPair,
): Uint8Array => {
    const bytes = sodium.from_base64(encrypted);
    const nonceLength = sodium.crypto_box_NONCEBYTES;
    const nonce = bytes.subarray(0, nonceLength);
    const cipher = bytes.subarray(nonceLength);

    const senderCurvePublic = sodium.crypto_sign_ed25519_pk_to_curve25519(
        senderPublicKey,
    ) as Uint8Array;
    const recipientCurveSecret = sodium.crypto_sign_ed25519_sk_to_curve25519(
        recipient.privateKey,
    ) as Uint8Array;

    return sodium.crypto_box_open_easy(cipher, nonce, senderCurvePublic, recipientCurveSecret);
};

/**
 * Шифрует данные для получателя
 * @param payload - Данные для шифрования
 * @param pair - Ключевая пара отправителя
 * @param recipient - Публичный ключ получателя
 * @returns Зашифрованные данные в виде Uint8Array (nonce + cipher)
 */
export const encrypt = (payload: Uint8Array, pair: KeyPair, recipient: Uint8Array): Uint8Array => {
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const recipientCurveKey = sodium.crypto_sign_ed25519_pk_to_curve25519(recipient);
    const senderCurveSecret = sodium.crypto_sign_ed25519_sk_to_curve25519(pair.privateKey);
    const cipher = sodium.crypto_box_easy(payload, nonce, recipientCurveKey, senderCurveSecret);

    const encrypted = new Uint8Array(nonce.length + cipher.length);
    encrypted.set(nonce);
    encrypted.set(cipher, nonce.length);

    return encrypted;
};

export const encodeText = (message: string): Uint8Array => {
    return new TextEncoder().encode(message);
};

export const decodeText = (bytes: Uint8Array) => {
    return new TextDecoder().decode(bytes);
};
