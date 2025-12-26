"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface LoginSeedProps {
  onLogin: () => void
  onBack: () => void
}

export function LoginSeed({ onLogin, onBack }: LoginSeedProps) {
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(""))
  const [error, setError] = useState("")

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...seedWords]
    newWords[index] = value.toLowerCase().trim()
    setSeedWords(newWords)
    setError("")
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const words = pastedText.toLowerCase().trim().split(/\s+/)

    if (words.length === 12) {
      setSeedWords(words)
      setError("")
    }
  }

  const handleLogin = () => {
    const allFilled = seedWords.every((word) => word.length > 0)

    if (!allFilled) {
      setError("Заполните все 12 слов seed-фразы")
      return
    }

    // Проверяем, существует ли сохраненная seed-фраза
    const savedSeed = localStorage.getItem("messenger_seed")

    if (savedSeed) {
      const savedWords = JSON.parse(savedSeed)
      const isMatch = savedWords.every((word: string, index: number) => word === seedWords[index])

      if (!isMatch) {
        setError("Неверная seed-фраза")
        return
      }
    } else {
      // Если нет сохраненной фразы, сохраняем введенную
      localStorage.setItem("messenger_seed", JSON.stringify(seedWords))
    }

    localStorage.setItem("messenger_seed_verified", "true")
    onLogin()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-card border-border">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Вход в аккаунт</h1>
          <p className="text-sm text-muted-foreground">Введите вашу seed-фразу из 12 слов для входа</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
            <X className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-secondary/50">
            {seedWords.map((word, index) => (
              <div key={index} className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {index + 1}.
                </span>
                <Input
                  value={word}
                  onChange={(e) => handleWordChange(index, e.target.value)}
                  onPaste={handlePaste}
                  className="pl-10"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">💡 Вы можете вставить все 12 слов одновременно через Ctrl+V</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={onBack} variant="outline" className="w-full sm:flex-1">
            Назад
          </Button>
          <Button onClick={handleLogin} className="w-full sm:flex-1">
            Войти
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">Ваша seed-фраза надежно хранится локально</p>
      </Card>
    </div>
  )
}
