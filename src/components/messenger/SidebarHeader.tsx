import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SpinIcon } from '@/components/ui/SpinIcon';

interface SidebarHeaderProps {
    onClearAllChats: () => void;
    onDeleteAllChats: () => void;
}

export function SidebarHeader({ onClearAllChats, onDeleteAllChats }: SidebarHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <div className="flex items-center gap-1 py-2">
                <SpinIcon width={38} height={32} />
                <span className="text-lg font-semibold">SecureChat</span>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={onClearAllChats} className="cursor-pointer">
                        <span>Очистить все чаты</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDeleteAllChats}
                        className="text-destructive focus:text-destructive cursor-pointer"
                    >
                        <span>Удалить все чаты</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
