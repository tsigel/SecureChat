import { HashAvatar } from '@/components/common/HashAvatar';
import { Contact } from '@/components/messenger/types';
import { useCallback } from 'react';
import dayjs from 'dayjs';
import { DATE_TIME_SHORT_FORMAT, TIME_SHORT_FORMAT } from '@/constants';

interface ContactItemProps {
    isSelected: boolean;
    onSelect: (contract: Contact) => void;
    name: string;
    id: string;
    online?: boolean;
    timestamp?: number;
    unread?: number;
    lastMessage?: string;
}

export const ContactItem = ({
                                name,
                                id,
                                isSelected,
                                onSelect,
                                online,
                                timestamp,
                                unread,
                                lastMessage
                            }: ContactItemProps) => {
    const onClick = useCallback(() => onSelect({ id, name }), [
        onSelect, id, name
    ]);
    const time = timestamp
        ? dayjs(timestamp)
        : void 0;

    const displayTime = time
        ? time.isBefore(dayjs().startOf('day'))
            ? time.format(DATE_TIME_SHORT_FORMAT)
            : time.format(TIME_SHORT_FORMAT)
        : void 0;

    const buttonClassNames = [
        'w-full flex items-start gap-3 px-4 py-3 transition-colors',
        'hover:bg-muted/50',
        isSelected ? 'bg-muted' : ''
    ].join(' ');

    return (
        <button onClick={onClick} className={buttonClassNames}>
            <div className="relative">
                <HashAvatar hash={id} name={name} className="h-12 w-12"/>
                {online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card"/>
                )}
            </div>

            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-baseline justify-between mb-1">
                    <span className="font-medium text-sm truncate">{name}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{displayTime}</span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
                    {unread != undefined && unread > 0 && (
                        <span
                            className="ml-2 shrink-0 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                        >
                            {unread}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};
