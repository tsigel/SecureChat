import type React from 'react'
import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useUnit } from 'effector-react'

import { SEED_WORDS_COUNT } from '@/constants'
import { seedToKeyPair } from '@/utils/seedHelpers'
import { login } from '@/model/user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface LoginSeedProps {
    onLogin: () => void;
    onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginSeedProps) {
    const [seedWords, setSeedWords] = useState<string[]>(Array(SEED_WORDS_COUNT).fill(''));
    const [error, setError] = useState('');
    const localLogin = useUnit(login);

    const handleWordChange = useCallback((index: number, value: string) => {
        setSeedWords((prev) => {
            const newWords = [...prev];
            newWords[index] = value.toLowerCase().trim();
            return newWords;
        });
        setError('');
    }, []);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const words = pastedText.toLowerCase().trim().split(/\s+/);

        if (words.length === SEED_WORDS_COUNT) {
            setSeedWords(words);
            setError('');
        }
    }, []);

    const handleLogin = useCallback(() => {
        const allFilled = seedWords.every((word) => word.length > 0);

        if (!allFilled) {
            setError(`Заполните все ${SEED_WORDS_COUNT} слов seed-фразы`);
            return;
        }

        const seed = seedWords.join(' ');

        const keyPair = seedToKeyPair(seed);

        if (keyPair.isErr()) {
            setError('Неверная seed-фраза')
            return;
        }

        localLogin(seed);
        onLogin();
    }, [seedWords, onLogin]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-8 space-y-6 bg-card border-border">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-foreground">Вход в аккаунт</h1>
                    <p className="text-sm text-muted-foreground">Введите вашу seed-фразу из {SEED_WORDS_COUNT} слов для входа</p>
                </div>

                {error && (
                    <div
                        className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                        <X className="h-4 w-4 text-destructive shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div
                        className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-secondary/50">
                        {seedWords.map((word, index) => (
                            <div key={index} className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    {index + 1}.
                                </span>
                                <Input
                                    value={word}
                                    onChange={(e) => handleWordChange(index, e.target.value)}
                                    onPaste={handlePaste}
                                    className="pl-10"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="bg-secondary/50 border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">💡 Вы можете вставить все {SEED_WORDS_COUNT} слов одновременно через
                            Ctrl+V</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={onBack} variant="outline" className="w-full sm:flex-1">
                        Назад
                    </Button>
                    <Button onClick={handleLogin} className="w-full sm:flex-1">
                        Войти
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">Ваша seed-фраза надежно хранится локально</p>
            </Card>
        </div>
    );
}
