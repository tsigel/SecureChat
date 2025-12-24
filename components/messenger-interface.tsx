"use client"

import { useState, useEffect } from "react"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { ContactsList } from "./contacts-list"
import { HashAvatar } from "./hash-avatar"
import { SpinIcon } from "./ui/spin-icon"
import { Search, MoreVertical, Menu, LogOut, MessageSquare, UserPlus, Copy } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export type Message = {
  id: string
  text: string
  sender: "user" | "contact"
  timestamp: Date
}

export type Contact = {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread?: number
  online?: boolean
  hash?: string
}

const initialContacts: Contact[] = [
  {
    id: "1",
    name: "Анна Иванова",
    lastMessage: "Отлично, увидимся завтра!",
    timestamp: "14:32",
    unread: 2,
    online: true,
    hash: "b94d27b9934d3e08a52e52d7da7abfac69f42a29278e357979743a117806f00b",
  },
  {
    id: "2",
    name: "Дмитрий Петров",
    lastMessage: "Спасибо за информацию",
    timestamp: "13:15",
    online: true,
    hash: "e4b7fa08462199927c2235a11c87d54a7a828a863796540c53f35a3e52ff55ec",
  },
  {
    id: "3",
    name: "Елена Смирнова",
    lastMessage: "Документы отправлены",
    timestamp: "Вчера",
    hash: "7f42a29278e357979743a117806f00b94d27b9934d3e08a52e52d7da7abfa",
  },
  {
    id: "4",
    name: "Александр Козлов",
    lastMessage: "Как дела с проектом?",
    timestamp: "Вчера",
    online: false,
    hash: "52d7da7abfac69f42a29278e357979743a117806f00bb94d27b9934d3e08a5",
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Привет! Как проходит работа над проектом?",
    sender: "contact",
    timestamp: new Date("2025-01-20T10:30:00"),
  },
  {
    id: "2",
    text: "Привет! Всё отлично, почти закончил основной функционал",
    sender: "user",
    timestamp: new Date("2025-01-20T10:32:00"),
  },
  {
    id: "3",
    text: "Отличные новости! Можем встретиться завтра чтобы обсудить детали?",
    sender: "contact",
    timestamp: new Date("2025-01-20T10:35:00"),
  },
  {
    id: "4",
    text: "Конечно, давай в 15:00?",
    sender: "user",
    timestamp: new Date("2025-01-20T10:36:00"),
  },
  {
    id: "5",
    text: "Отлично, увидимся завтра!",
    sender: "contact",
    timestamp: new Date("2025-01-20T14:32:00"),
  },
]

export function MessengerInterface() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserHash, setNewUserHash] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState("")
  const [userHash, setUserHash] = useState<string>("")

  useEffect(() => {
    const deriveHash = async () => {
      const storedSeed = localStorage.getItem("messenger_seed")
      if (storedSeed) {
        try {
          const seedArray = JSON.parse(storedSeed)
          const seedString = seedArray.join(" ")
          const msgUint8 = new TextEncoder().encode(seedString)
          const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
          setUserHash(hashHex)
        } catch (e) {
          console.error("Failed to derive hash", e)
        }
      }
    }
    deriveHash()
  }, [])

  const handleAddUser = () => {
    const trimmedHash = newUserHash.trim()
    const trimmedName = newUserName.trim()

    if (!trimmedHash || !trimmedName) return

    const newContact: Contact = {
      id: Date.now().toString(),
      name: trimmedName,
      lastMessage: "Диалог не начат",
      timestamp: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      online: false,
      hash: trimmedHash,
    }

    setContacts((prev) => [newContact, ...prev])
    setSelectedContact(newContact)
    setNewUserHash("")
    setNewUserName("")
    setIsAddUserOpen(false)
  }

  const handleCancelAddUser = () => {
    setNewUserHash("")
    setNewUserName("")
    setIsAddUserOpen(false)
  }

  const handleDeleteUser = () => {
    const newContacts = contacts.filter((c) => c.id !== selectedContact.id)
    setContacts(newContacts)
    setMessages([])
    if (newContacts.length > 0) {
      setSelectedContact(newContacts[0])
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const handleRenameUser = () => {
    if (!renameValue) return
    const updatedContacts = contacts.map((c) =>
      c.id === selectedContact.id ? { ...c, name: renameValue } : c
    )
    setContacts(updatedContacts)
    setSelectedContact({ ...selectedContact, name: renameValue })
    setIsRenameOpen(false)
  }

  const handleClearAllChats = () => {
    setMessages([])
  }

  const handleDeleteAllChats = () => {
    setContacts([])
    setMessages([])
  }

  const openRenameDialog = () => {
    setRenameValue(selectedContact.name)
    setIsRenameOpen(true)
  }

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages([...messages, newMessage])
  }

  const handleLogout = () => {
    localStorage.removeItem("messenger_seed_verified")
    localStorage.removeItem("userSeedPhrase")
    window.location.reload()
  }

  const hasContacts = contacts.length > 0

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar with contacts */}
      <aside
        className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
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
                <DropdownMenuItem onClick={handleClearAllChats} className="cursor-pointer">
                  <span>Очистить все чаты</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteAllChats}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <span>Удалить все чаты</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search and Add User */}
          <div className="p-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary border-0 focus-visible:ring-1"
                />
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Добавить пользователя</DialogTitle>
                    <DialogDescription>
                      Введите ID (hash) и имя нового контакта для начала общения.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="user-hash">ID (hash)</Label>
                      <Input
                        id="user-hash"
                        placeholder="e4b7fa08462199927c2235a11c87d54a7a828a863796540c53f35a3e52ff55ec"
                        value={newUserHash}
                        onChange={(e) => setNewUserHash(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="user-name">Имя</Label>
                      <Input
                        id="user-name"
                        placeholder="Введите имя"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCancelAddUser}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddUser} disabled={!newUserHash || !newUserName}>
                      Добавить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Contacts list */}
          <ContactsList
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={(contact) => {
              setSelectedContact(contact)
              setIsSidebarOpen(false)
            }}
            searchQuery={searchQuery}
          />

          {/* Current account block */}
          <div className="mt-auto p-3 border-t border-border">
            <div className="flex items-center gap-3">
              <HashAvatar hash={userHash} name="Vasya" className="h-10 w-10" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Vasya</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userHash ? `${userHash.slice(0, 4)}...${userHash.slice(-4)}` : "Deriving..."}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-muted shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-48">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выход</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex flex-col flex-1 min-w-0">
        {hasContacts ? (
          <>
            {/* Chat header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              {isChatSearchOpen ? (
                <div className="flex-1 flex items-center pr-4 pt-1 mb-1">
                  <Input
                    className="h-8 -mr-12"
                    placeholder="Поиск в чате..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
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
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                    <HashAvatar hash={selectedContact.hash} name={selectedContact.name} className="h-10 w-10" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{selectedContact.name}</span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>
                          {selectedContact.hash
                            ? `${selectedContact.hash.slice(0, 4)}...${selectedContact.hash.slice(-4)}`
                            : "No ID"}
                        </span>
                        {selectedContact.hash && (
                          <Copy
                            className="h-3 w-3 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => navigator.clipboard.writeText(selectedContact.hash!)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-1">
                <Button
                  variant={isChatSearchOpen ? "secondary" : "ghost"}
                  size="icon"
                  className="hover:bg-muted"
                  onClick={() => {
                    setIsChatSearchOpen(!isChatSearchOpen)
                    if (!isChatSearchOpen) setChatSearchQuery("")
                    if (isChatSearchOpen) setChatSearchQuery("")
                  }}
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
                    <DropdownMenuItem onClick={openRenameDialog} className="cursor-pointer">
                      <span>Переименовать</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleClearChat} className="cursor-pointer">
                      <span>Очистить чат</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteUser}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <span>Удалить пользователя</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Rename Dialog */}
                <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Переименовать пользователя</DialogTitle>
                      <DialogDescription>
                        Введите новое имя для {selectedContact.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rename-value">Имя</Label>
                        <Input
                          id="rename-value"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleRenameUser} disabled={!renameValue}>
                        Сохранить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Messages */}
            <MessageList
              messages={messages.filter((m) => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))}
              contactName={selectedContact.name}
              contactHash={selectedContact.hash}
            />

            {/* Input */}
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
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
              <Button onClick={() => setIsAddUserOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Добавить пользователя
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Overlay for mobile */}
      {
        isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )
      }
    </div >
  )
}
