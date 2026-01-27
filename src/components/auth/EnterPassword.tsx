import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HashAvatar } from '@/components/common/HashAvatar';
import { useUnit } from 'effector-react';
import { loginWithPassword, $loginError, type StoredAccount } from '@/model/user';

interface EnterPasswordProps {
    account: StoredAccount;
    onSuccess: () => void;
    onBack?: () => void;
}

export function EnterPassword({ account, onSuccess, onBack }: EnterPasswordProps) {
    const [password, setPassword] = useState('');
    const error = useUnit($loginError);
    const localLoginWithPassword = useUnit(loginWithPassword);

    const handleLogin = useCallback(() => {
        if (password) {
            localLoginWithPassword({ account, password });
            onSuccess();
        }
    }, [account, password, localLoginWithPassword, onSuccess]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-card border-border">
                <div className="flex flex-col items-center gap-4 text-center">
                    <HashAvatar 
                        hash={account.publicKey} 
                        name={account.name} 
                        className="h-16 w-16" 
                    />
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Введите пароль</h1>
                        <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                            Вход в аккаунт <strong>{account.name}</strong>
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-password">Пароль</Label>
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            autoFocus
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} className="w-full sm:flex-1">
                            Назад
                        </Button>
                    )}
                    <Button 
                        onClick={handleLogin} 
                        disabled={!password} 
                        className="w-full sm:flex-1"
                    >
                        Войти
                    </Button>
                </div>
            </Card>
        </div>
    );
}
