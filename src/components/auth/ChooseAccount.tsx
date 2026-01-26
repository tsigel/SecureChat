import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HashAvatar } from '@/components/common/HashAvatar';
import { Key, Trash2 } from 'lucide-react';

interface ChooseAccountProps {
    accounts: any[];
    onSelect: (account: any) => void;
    onDelete: (account: any) => void;
    onLoginWithSeed: () => void;
    onBack?: () => void;
}

export function ChooseAccount({ accounts, onSelect, onDelete, onLoginWithSeed, onBack }: ChooseAccountProps) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-card border-border">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Выберите аккаунт</h1>
                    <p className="text-sm text-muted-foreground">
                        Выберите сохраненный аккаунт для входа.
                    </p>
                </div>

                <div className="space-y-3">
                    {accounts.length > 0 ? (
                        accounts.map((account, index) => (
                            <div
                                key={account.publicKey || index}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground transition-all"
                            >
                                <button
                                    onClick={() => onSelect(account)}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                >
                                    <HashAvatar 
                                        hash={account.publicKey} 
                                        name={account.name} 
                                        className="h-10 w-10 shrink-0" 
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{account.name}</p>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">
                                            {account.publicKey.slice(0, 6)}...{account.publicKey.slice(-6)}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(account);
                                    }}
                                    className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    title="Удалить аккаунт"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border border-dashed border-border rounded-lg">
                            <p className="text-sm text-muted-foreground">Нет сохраненных аккаунтов</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-2">
                    <Button 
                        variant="outline" 
                        onClick={onLoginWithSeed} 
                        className="w-full flex items-center gap-2"
                    >
                        <Key className="h-4 w-4" />
                        Войти по seed-фразе
                    </Button>
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} className="w-full">
                            Назад
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
