import type React from 'react'
import { useState, useCallback } from 'react'
import { X } from 'lucide-react'

import { SEED_WORDS_COUNT } from '@/constants'
import { seedToKeyPair } from '@/utils/seedHelpers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChooseAccount } from '@/components/auth/ChooseAccount'
import { EnterPassword } from '@/components/auth/EnterPassword'
import { CreateName } from '@/components/auth/CreateName'
import { CreatePassword } from '@/components/auth/CreatePassword'

interface LoginSeedProps {
    onLogin: () => void;
    onBack: () => void;
}

type LoginStep = 'choose_account' | 'enter_password' | 'enter_seed' | 'create_name' | 'create_password';

export function LoginPage({ onLogin, onBack }: LoginSeedProps) {
    const [step, setStep] = useState<LoginStep>('choose_account');
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [userName, setUserName] = useState('');
    const [seedWords, setSeedWords] = useState<string[]>(Array(SEED_WORDS_COUNT).fill(''));
    const [error, setError] = useState('');
    const [accounts, setAccounts] = useState<any[]>(() => 
        JSON.parse(localStorage.getItem('securechat_accounts') || '[]')
    );

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

    const handleSeedSubmit = useCallback(() => {
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

        setStep('create_name');
    }, [seedWords]);

    const handleSelectAccount = useCallback((account: any) => {
        setSelectedAccount(account);
        setStep('enter_password');
    }, []);

    const handleDeleteAccount = useCallback((account: any) => {
        const updatedAccounts = accounts.filter((a: any) => a.publicKey !== account.publicKey);
        localStorage.setItem('securechat_accounts', JSON.stringify(updatedAccounts));
        setAccounts(updatedAccounts);
    }, [accounts]);

    const handleBackToChoose = useCallback(() => {
        setStep('choose_account');
        setSelectedAccount(null);
    }, []);

    const handleNameNext = useCallback((name: string) => {
        setUserName(name);
        setStep('create_password');
    }, []);

    if (step === 'choose_account') {
        return (
            <ChooseAccount 
                accounts={accounts}
                onSelect={handleSelectAccount}
                onDelete={handleDeleteAccount}
                onLoginWithSeed={() => setStep('enter_seed')}
                onBack={onBack}
            />
        );
    }

    if (step === 'enter_password') {
        return (
            <EnterPassword 
                account={selectedAccount}
                onSuccess={onLogin}
                onBack={handleBackToChoose}
            />
        );
    }

    if (step === 'create_name') {
        return (
            <CreateName 
                seed={seedWords.join(' ')}
                onNext={handleNameNext}
                onBack={() => setStep('enter_seed')}
            />
        );
    }

    if (step === 'create_password') {
        return (
            <CreatePassword 
                seed={seedWords.join(' ')}
                name={userName}
                onComplete={onLogin}
                onBack={() => setStep('create_name')}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-8 space-y-6 bg-card border-border">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-foreground">Вход по seed-фразе</h1>
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
                    <Button onClick={() => setStep('choose_account')} variant="outline" className="w-full sm:flex-1">
                        Назад
                    </Button>
                    <Button onClick={handleSeedSubmit} className="w-full sm:flex-1">
                        Далее
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">Ваша seed-фраза надежно хранится локально</p>
            </Card>
        </div>
    );
}
