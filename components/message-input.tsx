"use client"

import type React from "react"

import { useState } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

interface MessageInputProps {
  onSendMessage: (text: string) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-2">
          <Button type="button" variant="ghost" size="icon" className="shrink-0 hover:bg-muted">
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать сообщение..."
              className="min-h-[44px] max-h-32 resize-none pr-10 bg-secondary border-0 focus-visible:ring-1"
              rows={1}
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 hover:bg-muted/50">
              <Smile className="h-5 w-5" />
            </Button>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim()}
            className="shrink-0 bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  )
}
