import { useState } from 'react';
import { LogOut, MoreVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HashAvatar } from '@/components/common/HashAvatar';
import { ShareAccountDialog } from './ShareAccountDialog';
import { SettingsDialog } from './SettingsDialog';

interface CurrentAccountBlockProps {
    userHash: string | null;
    userName?: string;
    onLogout: () => void;
}

export function CurrentAccountBlock({
    userHash,
    userName = 'User',
    onLogout,
}: CurrentAccountBlockProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <div className="mt-auto p-3 border-t border-border">
            <div className="flex items-center gap-3">
                <HashAvatar hash={userHash ?? undefined} name={userName} className="h-10 w-10" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {userHash
                            ? `${userHash.slice(0, 4)}...${userHash.slice(-4)}`
                            : 'Deriving...'}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <ShareAccountDialog userHash={userHash} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-muted shrink-0">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="w-48">
                            <DropdownMenuItem
                                onClick={() => setSettingsOpen(true)}
                                className="cursor-pointer"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Настройки</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Выход</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <SettingsDialog isOpen={settingsOpen} onOpenChange={setSettingsOpen} />
            </div>
        </div>
    );
}
