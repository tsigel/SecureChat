"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import type { Message } from "./messenger-interface"

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {message.sender === "contact" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-muted">АИ</AvatarFallback>
              </Avatar>
            )}

            <div
              className={`flex flex-col gap-1 max-w-[70%] ${message.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-neutral-800 text-card-foreground rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <span className="text-xs text-muted-foreground px-2">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
