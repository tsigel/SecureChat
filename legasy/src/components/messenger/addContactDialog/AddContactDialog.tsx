import { ChangeEventHandler, useCallback, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnit } from 'effector-react';
import { $isOpen, setOpenState } from '@/components/messenger/addContactDialog/addContactModel';
import sodium from 'libsodium-wrappers';
import { addOrRenameContact } from '@/model/contacts';
import { $pk } from '@/model/user';

export function AddContactDialog() {
    const isOpen = useUnit($isOpen);
    const userPublicKeyHex = useUnit($pk);
    const localSetOpenState = useUnit(setOpenState);
    const localAddContact = useUnit(addOrRenameContact);

    const [userHash, setUserHash] = useState('');
    const [userName, setUserName] = useState('');

    const onChangeHash: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setUserHash(e.target.value);
    }, []);

    const onChangeName: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setUserName(e.target.value);
    }, []);

    const handleAdd = useCallback(() => {
        const trimmedHash = userHash.trim();
        const trimmedName = userName.trim();

        if (!trimmedHash || !trimmedName || !userPublicKeyHex) return;

        if (!is_valid_ed25519_public_key(sodium.from_hex(userHash))) {
            return void 0;
        }

        localAddContact({
            id: trimmedHash,
            name: trimmedName,
            owner: userPublicKeyHex,
        });

        setUserHash('');
        setUserName('');
        localSetOpenState(false);
    }, [userHash, userName, userPublicKeyHex]);

    const handleCancel = useCallback(() => {
        setUserHash('');
        setUserName('');
        localSetOpenState(false);
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={localSetOpenState}>
            <DialogTrigger asChild>
                {
                    <Button variant="ghost" size="icon">
                        <UserPlus className="h-4 w-4" />
                    </Button>
                }
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Добавить пользователя</DialogTitle>
                    <DialogDescription>
                        Введите ID (hash) и имя нового контакта для начала общения.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="user-hash">ID (hash)</Label>
                        <Input
                            id="user-hash"
                            placeholder="e4b7fa08462199927c2235a11c87d54a7a828a863796540c53f35a3e52ff55ec"
                            value={userHash}
                            onChange={onChangeHash}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="user-name">Имя</Label>
                        <Input
                            id="user-name"
                            placeholder="Введите имя"
                            value={userName}
                            onChange={onChangeName}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Отмена
                    </Button>
                    <Button onClick={handleAdd} disabled={!userHash || !userName}>
                        Добавить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function is_valid_ed25519_public_key(pk: Uint8Array): boolean {
    if (pk.length !== sodium.crypto_sign_PUBLICKEYBYTES) {
        return false;
    }

    try {
        sodium.crypto_sign_ed25519_pk_to_curve25519(pk);
        return true;
    } catch {
        return false;
    }
}
