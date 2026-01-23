import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddContactDialog } from './addContactDialog/AddContactDialog';
import { useUnit } from 'effector-react';
import { $search, setSearch } from '@/model/contacts';
import { ChangeEventHandler, useCallback } from 'react';

export function SidebarSearch() {
    const search = useUnit($search);
    const localSetSearch = useUnit(setSearch);

    const onChangeSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        localSetSearch(e.target.value || null);
    }, [localSetSearch]);

    return (
        <div className="p-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск"
                        value={search || ''}
                        onChange={onChangeSearch}
                        className="pl-9 bg-secondary border-0 focus-visible:ring-1"
                    />
                </div>
                <AddContactDialog />
            </div>
        </div>
    );
}
