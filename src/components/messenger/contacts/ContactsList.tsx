import { useCallback, useMemo } from 'react';
import type { Contact } from '@/components/messenger/types';
import { ContactItem } from './ContactItem';
import { useUnit } from 'effector-react/effector-react.mjs';
import { $contacts, $selectedContact, ContactsGate, selectContact } from '@/model/contacts';
import { useGate } from 'effector-react';
import { $search } from '@/model/contacts';

export const ContactsList = () => {
    useGate(ContactsGate);

    const contacts = useUnit($contacts);
    const search = useUnit($search);
    const selectedContact = useUnit($selectedContact);
    const localSelectContact = useUnit(selectContact);

    const filteredContacts = useMemo(() =>
        contacts.filter((contact) => contact.name.toLowerCase().includes((search || '').toLowerCase())),
        [contacts, search]
    );

    const handleSelectContact = useCallback((contact: Contact) => {
        localSelectContact(contact.id);
    }, [localSelectContact]);

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
