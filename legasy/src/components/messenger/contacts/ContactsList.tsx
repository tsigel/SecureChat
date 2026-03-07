import { useCallback, useMemo } from 'react';
import type { Contact } from '@/components/messenger/types';
import { ContactItem } from './ContactItem';
import { useUnit } from 'effector-react/effector-react.mjs';
import { $allChats, $selectedContact, ContactsGate, selectContact } from '@/model/contacts';
import { useGate } from 'effector-react';
import { $search } from '@/model/contacts';

interface ContactsListProps {
    onSelectContact?: () => void;
}

export const ContactsList = ({ onSelectContact }: ContactsListProps) => {
    useGate(ContactsGate);

    const contacts = useUnit($allChats);
    const search = useUnit($search);
    const selectedContact = useUnit($selectedContact);
    const localSelectContact = useUnit(selectContact);

    const filteredContacts = useMemo(
        () =>
            contacts.filter((contact) =>
                contact.name.toLowerCase().includes((search || '').toLowerCase()),
            ),
        [contacts, search],
    );

    const handleSelectContact = useCallback(
        (contact: Contact) => {
            localSelectContact(contact.id);
            onSelectContact?.();
        },
        [localSelectContact, onSelectContact],
    );

    return (
        <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
                <ContactItem
                    key={contact.id}
                    {...contact}
                    isSelected={selectedContact?.id === contact.id}
                    onSelect={handleSelectContact}
                />
            ))}
        </div>
    );
};
