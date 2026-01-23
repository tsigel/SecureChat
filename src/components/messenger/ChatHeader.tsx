import { useState, useCallback } from 'react';
import { Search, MoreVertical, Menu, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { HashAvatar } from '@/components/common/HashAvatar';
import type { Contact } from './types';
import { RenameUserDialog } from './RenameUserDialog';

interface ChatHeaderProps {
    contact: Contact;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    isChatSearchOpen: boolean;
    onToggleChatSearch: () => void;
    chatSearchQuery: string;
    onChatSearchChange: (query: string) => void;
    onRename: (newName: string) => void;
    onClearChat: () => void;
    onDeleteUser: () => void;
}

export function ChatHeader({
    contact,
    isSidebarOpen,
    onToggleSidebar,
    isChatSearchOpen,
    onToggleChatSearch,
    chatSearchQuery,
    onChatSearchChange,
    onRename,
    onClearChat,
    onDeleteUser,
}: ChatHeaderProps) {
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    const handleCopyHash = useCallback(() => {
        if (contact.id) {
            navigator.clipboard.writeText(contact.id);
        }
    }, [contact.id]);

    const handleChatSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChatSearchChange(e.target.value);
    }, [onChatSearchChange]);

    const handleToggleChatSearchClick = useCallback(() => {
        onToggleChatSearch();
        onChatSearchChange('');
    }, [onToggleChatSearch, onChatSearchChange]);

    const handleOpenRename = useCallback(() => {
        setIsRenameOpen(true);
    }, []);

    return (
        <>
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                {isChatSearchOpen ? (
                    <div className="flex-1 flex items-center pr-4 pt-1 mb-1">
                        <Input
                            className="h-8 -mr-12"
                            placeholder="Поиск в чате..."
                            value={chatSearchQuery}
                            onChange={handleChatSearchChange}
                            autoFocus
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden hover:bg-muted"
                                onClick={onToggleSidebar}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <HashAvatar hash={contact.id} name={contact.name} className="h-10 w-10" />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{contact.name}</span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>
                                        {contact.id
                                            ? `${contact.id.slice(0, 4)}...${contact.id.slice(-4)}`
                                            : 'No ID'}
                                    </span>
                                    {contact.id && (
                                        <Copy
                                            className="h-3 w-3 cursor-pointer hover:text-foreground transition-colors"
                                            onClick={handleCopyHash}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-1">
                    <Button
                        variant={isChatSearchOpen ? 'secondary' : 'ghost'}
                        size="icon"
                        className="hover:bg-muted"
                        onClick={handleToggleChatSearchClick}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-muted">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleOpenRename} className="cursor-pointer">
                                <span>Переименовать</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onClearChat} className="cursor-pointer">
                                <span>Очистить чат</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onDeleteUser}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <span>Удалить пользователя</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <RenameUserDialog
                isOpen={isRenameOpen}
                onOpenChange={setIsRenameOpen}
                currentName={contact.name}
                onRename={onRename}
            />
        </>
    );
}
