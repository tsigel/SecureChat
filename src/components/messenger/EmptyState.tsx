import { MessageSquare, UserPlus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    onAddUser: () => void;
    onToggleSidebar: () => void;
}

export function EmptyState({ onAddUser, onToggleSidebar }: EmptyStateProps) {
    return (
        <div className="flex flex-col flex-1 relative">
            <header className="flex items-center px-4 py-3 md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted"
                    onClick={onToggleSidebar}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </header>
            <div className="flex flex-1 items-center justify-center px-6">
                <div className="flex flex-col items-center text-center gap-3 max-w-md">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">У вас нет диалогов</p>
                        <p className="text-sm text-muted-foreground">
                            Добавьте пользователей, чтобы начать общение.
                        </p>
                    </div>
                    <Button onClick={onAddUser} className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Добавить пользователя
                    </Button>
                </div>
            </div>
        </div>
    );
}
