"use client"

import { memo, useMemo, useCallback } from "react"
import { HashAvatar } from "./hash-avatar"
import type { Contact } from "./messenger-interface"

interface ContactsListProps {
  contacts: Contact[]
  selectedContact: Contact
  onSelectContact: (contact: Contact) => void
  searchQuery: string
}

const ContactItem = memo(function ContactItem({
  contact,
  isSelected,
  onSelect
}: {
  contact: Contact
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full flex items-start gap-3 px-4 py-3 transition-colors
        hover:bg-muted/50
        ${isSelected ? "bg-muted" : ""}
      `}
    >
      <div className="relative">
        <HashAvatar hash={contact.hash} name={contact.name} className="h-12 w-12" />
        {contact.online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-medium text-sm truncate">{contact.name}</span>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">{contact.timestamp}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
          {contact.unread && (
            <span className="ml-2 shrink-0 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {contact.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
})

export const ContactsList = memo(function ContactsList({
  contacts,
  selectedContact,
  onSelectContact,
  searchQuery
}: ContactsListProps) {
  const filteredContacts = useMemo(() =>
    contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [contacts, searchQuery]
  )

  const handleSelectContact = useCallback((contact: Contact) => {
    onSelectContact(contact)
  }, [onSelectContact])

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredContacts.map((contact) => (
        <ContactItem
          key={contact.id}
          contact={contact}
          isSelected={selectedContact.id === contact.id}
          onSelect={() => handleSelectContact(contact)}
        />
      ))}
    </div>
  )
})
