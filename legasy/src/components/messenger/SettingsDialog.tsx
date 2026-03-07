import { Volume2, VolumeOff } from 'lucide-react';
import { useUnit } from 'effector-react';
import { $soundEnabled, toggleSound } from '@/model/settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SettingsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ isOpen, onOpenChange }: SettingsDialogProps) {
    const soundEnabled = useUnit($soundEnabled);
    const localToggleSound = useUnit(toggleSound);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Настройки</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <button
                        onClick={localToggleSound}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {soundEnabled ? (
                                <Volume2 className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <VolumeOff className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="text-sm">Звук уведомлений</span>
                        </div>
                        <div
                            className={`relative w-10 h-6 rounded-full transition-colors ${
                                soundEnabled ? 'bg-emerald-500' : 'bg-muted'
                            }`}
                        >
                            <div
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                    soundEnabled ? 'translate-x-5' : 'translate-x-1'
                                }`}
                            />
                        </div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
