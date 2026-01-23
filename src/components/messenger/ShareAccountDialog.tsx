import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShareAccountDialogProps {
    userHash: string | null;
    trigger?: React.ReactNode;
}

export function ShareAccountDialog({ userHash, trigger }: ShareAccountDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const generateQr = async () => {
            if (!userHash) {
                setQrUrl('');
                return;
            }
            try {
                const url = await QRCode.toDataURL(userHash, { margin: 1, width: 220 });
                if (isMounted) setQrUrl(url);
            } catch (e) {
                console.error('Failed to generate QR code', e);
            }
        };
        generateQr();
        return () => {
            isMounted = false;
        };
    }, [userHash]);

    const handleCopyHash = useCallback(async () => {
        if (!userHash) return;
        await navigator.clipboard.writeText(userHash);
    }, [userHash]);

    const handleShare = useCallback(async () => {
        if (!userHash || isSharing) return;

        const shareData: ShareData = {
            title: 'SecureChat аккаунт',
            text: `Мой ID (hash): ${userHash}`,
        };

        if (qrUrl) {
            try {
                const response = await fetch(qrUrl);
                const blob = await response.blob();
                const file = new File([blob], 'securechat-qr.png', {
                    type: blob.type || 'image/png',
                });
                if (!navigator.canShare || navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }
            } catch (error) {
                console.error('Failed to prepare QR file for sharing', error);
            }
        }

        if (!navigator.share) return;

        try {
            setIsSharing(true);
            await navigator.share(shareData);
            setIsOpen(false);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            if (error instanceof DOMException && error.name === 'InvalidStateError') return;
            console.error('Failed to share account', error);
        } finally {
            setIsSharing(false);
        }
    }, [userHash, qrUrl]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <QrCode className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Поделиться аккаунтом</DialogTitle>
                    <DialogDescription>
                        Сканируйте QR или скопируйте ID, чтобы добавить вас в контакты.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="flex items-center justify-center">
                        {qrUrl ? (
                            <img
                                src={qrUrl}
                                alt="QR-код аккаунта"
                                className="h-44 w-44 rounded-lg border border-border bg-white p-2"
                            />
                        ) : (
                            <div className="h-44 w-44 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                                Генерация QR...
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="share-hash">ID (hash)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="share-hash"
                                value={userHash ?? ''}
                                readOnly
                                disabled
                                className="font-mono text-xs"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyHash}
                                disabled={!userHash}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={handleShare}
                    className="w-full"
                    disabled={!userHash || !qrUrl || isSharing}
                >
                    {isSharing ? 'Поделиться...' : 'Поделиться'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
