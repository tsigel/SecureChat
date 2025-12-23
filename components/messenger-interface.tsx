"use client"

import { useState } from "react"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { ContactsList } from "./contacts-list"
import { Search, MoreVertical, Menu, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
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
  avatar?: string
  lastMessage: string
  timestamp: string
  unread?: number
  online?: boolean
}

const initialContacts: Contact[] = [
  {
    id: "1",
    name: "Анна Иванова",
    avatar: "/diverse-woman-portrait.png",
    lastMessage: "Отлично, увидимся завтра!",
    timestamp: "14:32",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Дмитрий Петров",
    avatar: "/man.jpg",
    lastMessage: "Спасибо за информацию",
    timestamp: "13:15",
    online: true,
  },
  {
    id: "3",
    name: "Елена Смирнова",
    avatar: "/professional-woman.png",
    lastMessage: "Документы отправлены",
    timestamp: "Вчера",
  },
  {
    id: "4",
    name: "Александр Козлов",
    avatar: "/casual-man.png",
    lastMessage: "Как дела с проектом?",
    timestamp: "Вчера",
    online: false,
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
  const [contacts] = useState<Contact[]>(initialContacts)
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-medium tracking-tight">Сообщения</h1>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-0 focus-visible:ring-1"
              />
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
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-muted"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
              <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{selectedContact.name}</span>
              <span className="text-xs text-muted-foreground">{selectedContact.online ? "В сети" : "Не в сети"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Search className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выход</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
