import sodium from 'libsodium-wrappers';
import { AppError } from '@/error';
import { err, ok, Result } from 'neverthrow';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

export type KeyPair = {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
};

export const generateSeed = () => generateMnemonic(wordlist, 256);

export class InvalidSeed extends AppError<'invalid-seed'> {
    public readonly kind = 'invalid-seed';
}

export const seedToKeyPair = (seed: string): Result<KeyPair, InvalidSeed> => {
    if (!validateMnemonic(seed, wordlist)) {
        return err(new InvalidSeed('Invalid seed phrase'));
    }

    const seed64 = mnemonicToSeedSync(seed);
    const CONTEXT = 'USERSIGN';
    const SUBKEY_ID = 1;

    const masterKey = sodium.crypto_generichash(
        sodium.crypto_kdf_KEYBYTES, // 32 байта
        seed64,
        new TextEncoder().encode(CONTEXT),
    ) as Uint8Array;

    const signingSeed = sodium.crypto_kdf_derive_from_key(
        sodium.crypto_sign_SEEDBYTES, // 32 байта
        SUBKEY_ID,
        CONTEXT,
        masterKey,
    ) as Uint8Array;

    return ok(sodium.crypto_sign_seed_keypair(signingSeed) as KeyPair);
};
