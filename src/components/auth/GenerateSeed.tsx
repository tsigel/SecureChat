import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Copy } from 'lucide-react';

interface GenerateSeedProps {
    seedPhrase: string[];
    onNext: () => void;
    onSeedChange: (seed: string[]) => void;
    onRegenerate: () => void;
    onBack?: () => void;
    onCancel?: () => void;
}

export function GenerateSeed({
    seedPhrase,
    onNext,
    onSeedChange,
    onRegenerate,
    onBack,
    onCancel,
}: GenerateSeedProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(seedPhrase.join(' '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [seedPhrase]);

    const handleWordChange = useCallback(
        (index: number, value: string) => {
            const nextSeed = [...seedPhrase];
            nextSeed[index] = value.toLowerCase().trim();
            onSeedChange(nextSeed);
        },
        [seedPhrase, onSeedChange],
    );

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-8 space-y-6 bg-card border-border">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-foreground">Запишите seed-фразу</h1>
                    <p className="text-sm text-muted-foreground">
                        Эта фраза из 12 слов - единственный способ восстановить доступ к вашему
                        аккаунту. Храните её в безопасном месте и никому не показывайте.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Ваша seed-фраза:</p>
                        <Button variant="outline" size="sm" onClick={onRegenerate}>
                            Сгенерировать другие фразы
                        </Button>
                    </div>

                    <div className="p-4 border border-border rounded-lg bg-secondary/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {seedPhrase.map((word, index) => (
                                <div key={index} className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono pointer-events-none">
                                        {index + 1}.
                                    </span>
                                    <Input
                                        value={word}
                                        onChange={(e) => handleWordChange(index, e.target.value)}
                                        placeholder="слово"
                                        className="pl-10 font-mono"
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="w-full gap-2 bg-transparent"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Скопировано
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Скопировать фразу
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm text-destructive font-medium">⚠️ Важно!</p>
                        <ul className="text-sm text-destructive/90 mt-2 space-y-1 list-disc list-inside">
                            <li>Никогда не делитесь этой фразой с другими</li>
                            <li>Запишите её на бумаге и храните в безопасном месте</li>
                            <li>Без этой фразы вы не сможете восстановить доступ</li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {onBack && (
                            <Button variant="outline" onClick={onBack} className="w-full sm:flex-1">
                                Назад
                            </Button>
                        )}

                        {onCancel && (
                            <Button variant="ghost" onClick={onCancel} className="w-full sm:flex-1">
                                Отмена
                            </Button>
                        )}
                        <Button onClick={onNext} className="w-full sm:flex-1">
                            Я записал seed-фразу, продолжить
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
