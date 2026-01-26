import { useCallback, useState } from 'react';
import { useUnit } from 'effector-react';
import { $pk, logOut } from '@/model/user';
import { MessageInput } from '@/components/messenger/MessageInput';
import { MessageList } from '@/components/messenger/MessageList';
import { Sidebar } from '@/components/messenger/Sidebar';
import { ChatHeader } from '@/components/messenger/ChatHeader';
import { EmptyState } from '@/components/messenger/EmptyState';
import { $contacts, $selectedContact, addOrRenameContact, deleteContact } from '@/model/contacts';
import { setOpenState } from '@/components/messenger/addContactDialog/addContactModel';

export function MessengerPage() {
  const selectedContact = useUnit($selectedContact);
  const contacts = useUnit($contacts);
  const localDeleteContact = useUnit(deleteContact);
  const localRenameContact = useUnit(addOrRenameContact);
  const localSetOpenState = useUnit(setOpenState);
  const publicKeyHex = useUnit($pk);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  const handleDeleteUser = useCallback(() => {
    if (selectedContact) {
      localDeleteContact(selectedContact.id);
    }
  }, [selectedContact, localDeleteContact]);

  const handleClearChat = useCallback(() => {
    // TODO ??
  }, []);

  const handleRenameUser = useCallback((newName: string) => {
    if (selectedContact && publicKeyHex) {
      localRenameContact({
        id: selectedContact.id,
        name: newName,
        owner: publicKeyHex
      });
    }
  }, [selectedContact, publicKeyHex, localRenameContact]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleToggleChatSearch = useCallback(() => {
    setIsChatSearchOpen(!isChatSearchOpen);
    if (isChatSearchOpen) setChatSearchQuery('');
  }, [isChatSearchOpen]);

  const handleAddUser = useCallback(() => {
    localSetOpenState(true);
  }, [localSetOpenState]);

  const hasContacts = contacts.length > 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onCloseSidebar={handleCloseSidebar}
      />

      <main className="flex flex-col flex-1 min-w-0">
        {hasContacts && selectedContact ? (
          <>
            <ChatHeader
              contact={selectedContact}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={handleToggleSidebar}
              isChatSearchOpen={isChatSearchOpen}
              onToggleChatSearch={handleToggleChatSearch}
              chatSearchQuery={chatSearchQuery}
              onChatSearchChange={setChatSearchQuery}
              onRename={handleRenameUser}
              onClearChat={handleClearChat}
              onDeleteUser={handleDeleteUser}
            />

            <MessageList />

            <MessageInput />
          </>
        ) : (
          <EmptyState 
            onAddUser={handleAddUser} 
            onToggleSidebar={handleToggleSidebar}
          />
        )}
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}
    </div>
  );
}
