import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { $showOfflineBanner } from '@/model/messages';
import { bindNetworkEvents } from '@/model/network';
import { cn } from '@/lib/utils';

export function OfflineBanner({ className }: { className?: string }) {
    const show = useUnit($showOfflineBanner);

    useEffect(() => {
        bindNetworkEvents();
    }, []);

    return (
        <div
            className={cn(
                'fixed left-0 right-0 top-0 z-50 border-b border-border bg-muted px-4 py-2 text-sm text-muted-foreground transition-transform',
                show ? 'translate-y-0' : '-translate-y-full',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            Оффлайн: нет интернета или недоступен сервер сообщений. Обновление сообщений
            приостановлено.
        </div>
    );
}
