import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RenameUserDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentName: string;
    onRename: (newName: string) => void;
}

export function RenameUserDialog({
    isOpen,
    onOpenChange,
    currentName,
    onRename,
}: RenameUserDialogProps) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
        }
    }, [isOpen, currentName]);

    const handleRename = useCallback(() => {
        if (!name.trim()) return;
        onRename(name.trim());
        onOpenChange(false);
    }, [name, onRename, onOpenChange]);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }, []);

    const handleCancel = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Переименовать пользователя</DialogTitle>
                    <DialogDescription>
                        Введите новое имя для {currentName}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="rename-value">Имя</Label>
                        <Input
                            id="rename-value"
                            value={name}
                            onChange={handleNameChange}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Отмена
                    </Button>
                    <Button onClick={handleRename} disabled={!name.trim()}>
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
