import { generateSeed, seedToKeyPair } from './src/utils/seedHelpers';
import { writeFile } from 'node:fs/promises';
import sodium from 'libsodium-wrappers';

const generate = () => {
    const seed = generateSeed();
    const keyPair = seedToKeyPair(seed);

    if (keyPair.isErr()) {
        throw keyPair.error;
    }

    const pair = keyPair.value;

    return {
        seed,
        keyPair: {
            publicKey: sodium.to_hex(pair.publicKey),
            privateKey: sodium.to_hex(pair.privateKey)
        }
    };
};

(async () => {
    await sodium.ready;

    await writeFile('./test.json', JSON.stringify({
        Alise: generate(),
        Bob: generate(),
        Govard: generate()
    }, null, 4));

    console.log('Файл test.json успешно создан!');
})();
