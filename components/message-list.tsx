"use client"

import { useEffect, useRef, useCallback, memo } from "react"
import { HashAvatar } from "./hash-avatar"
import type { Message } from "./messenger-interface"

interface MessageListProps {
  messages: Message[]
  contactName: string
  contactHash?: string
}

const MessageItem = memo(function MessageItem({
  message,
  formatTime,
  contactName,
  contactHash,
}: {
  message: Message
  formatTime: (date: Date) => string
  contactName: string
  contactHash?: string
}) {
  return (
    <div
      className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
    >
      {message.sender === "contact" && (
        <HashAvatar
          hash={contactHash}
          name={contactName}
          className="h-8 w-8 shrink-0"
        />
      )}

      <div
        className={`flex flex-col gap-1 max-w-[70%] ${message.sender === "user" ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl ${message.sender === "user"
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-neutral-800 text-card-foreground rounded-tl-sm"
            }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <span className="text-xs text-muted-foreground px-2">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
})

export const MessageList = memo(function MessageList({
  messages,
  contactName,
  contactHash,
}: MessageListProps & { contactHash?: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }, [])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} formatTime={formatTime} contactName={contactName} contactHash={contactHash} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
})
