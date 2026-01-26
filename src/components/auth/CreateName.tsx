import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnit } from 'effector-react';
import { updateUserName, login } from '@/model/user';

interface CreateNameProps {
    seed: string;
    onNext: (name: string) => void;
    onBack?: () => void;
}

export function CreateName({ seed, onNext, onBack }: CreateNameProps) {
    const [name, setName] = useState('');

    const handleContinue = useCallback(() => {
        if (name.trim()) {
            onNext(name.trim());
        }
    }, [name, onNext]);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }, []);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-card border-border">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Как вас зовут?</h1>
                    <p className="text-sm text-muted-foreground">
                        Это имя будет отображаться у ваших контактов.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-name">Ваше имя</Label>
                        <Input
                            id="user-name"
                            placeholder="Например, Иван"
                            value={name}
                            onChange={handleNameChange}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} className="w-full sm:flex-1">
                            Назад
                        </Button>
                    )}
                    <Button 
                        onClick={handleContinue} 
                        disabled={!name.trim()} 
                        className="w-full sm:flex-1"
                    >
                        Готово
                    </Button>
                </div>
            </Card>
        </div>
    );
}
