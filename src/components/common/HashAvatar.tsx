import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HashAvatarProps {
    hash?: string;
    name?: string;
    className?: string;
}

export function HashAvatar({ hash, name, className }: HashAvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!hash) {
            setAvatarUrl(null);
            return;
        }

        // Dynamic import to avoid SSR issues and force browser version
        // @ts-ignore
        import('squareicon/browser')
            .then((mod) => {
                const squareicon = mod.default || mod;
                try {
                    squareicon({ id: hash })
                        .then((data: string) => {
                            setAvatarUrl(data);
                        })
                        .catch((err: any) => {
                            console.error('Failed to generate avatar', err);
                        });
                } catch (e) {
                    console.error('Error calling squareicon', e);
                }
            })
            .catch((err) => {
                console.error('Failed to load squareicon', err);
            });
    }, [hash]);

    return (
        <Avatar className={cn('h-10 w-10', className)}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name || 'Avatar'}/>}
            <AvatarFallback className="bg-muted text-foreground">
                {name ? name[0].toUpperCase() : '?'}
            </AvatarFallback>
        </Avatar>
    );
}
