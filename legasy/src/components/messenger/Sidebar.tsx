import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { CurrentAccountBlock } from './CurrentAccountBlock';
import { useUnit } from 'effector-react';
import { $pk, logOut, $userName } from '@/model/user';
import { useCallback } from 'react';
import { ContactsList } from '@/components/messenger/contacts/ContactsList';

interface SidebarProps {
    onCloseSidebar?: () => void;
    isOpen: boolean;
}

export function Sidebar({ isOpen, onCloseSidebar }: SidebarProps) {
    const userHash = useUnit($pk);
    const userName = useUnit($userName);
    const localLogOut = useUnit(logOut);

    const localClearAllChats = useCallback(() => {
        //TODO
    }, []);

    const localDeleteAllChats = useCallback(() => {
        //TODO
    }, []);

    return (
        <aside
            className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
      `}
        >
            <div className="flex flex-col h-full">
                <SidebarHeader
                    onClearAllChats={localClearAllChats}
                    onDeleteAllChats={localDeleteAllChats}
                />
                <SidebarSearch />
                <ContactsList onSelectContact={onCloseSidebar} />
                <CurrentAccountBlock
                    userHash={userHash}
                    userName={userName}
                    onLogout={localLogOut}
                />
            </div>
        </aside>
    );
}
