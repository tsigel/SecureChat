import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnit } from 'effector-react';
import { signup, $hasUser, $signupError } from '@/model/user';

interface CreatePasswordProps {
    seed: string;
    name: string;
    onComplete: () => void;
    onBack?: () => void;
}

export function CreatePassword({ seed, name, onComplete, onBack }: CreatePasswordProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const localSignup = useUnit(signup);
    const hasUser = useUnit($hasUser);
    const signupError = useUnit($signupError);

    useEffect(() => {
        if (hasUser && isSubmitting) {
            onComplete();
        }
    }, [hasUser, isSubmitting, onComplete]);

    useEffect(() => {
        if (signupError) {
            setError(signupError);
            setIsSubmitting(false);
        }
    }, [signupError]);

    const handleComplete = useCallback(() => {
        if (!password) {
            setError('Введите пароль');
            return;
        }
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        
        setIsSubmitting(true);
        setTimeout(() => {
            localSignup({ seed, name, password });
        }, 100);
    }, [seed, name, password, confirmPassword, localSignup]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-card border-border">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Защитите аккаунт</h1>
                    <p className="text-sm text-muted-foreground">
                        Придумайте пароль для шифрования данных на этом устройстве.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
                        />
                    </div>
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} className="w-full sm:flex-1">
                            Назад
                        </Button>
                    )}
                    <Button 
                        onClick={handleComplete} 
                        disabled={!password || !confirmPassword || isSubmitting} 
                        className="w-full sm:flex-1"
                    >
                        {isSubmitting ? 'Сохранение...' : 'Завершить'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
