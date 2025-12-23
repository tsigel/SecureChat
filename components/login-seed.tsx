"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X } from "lucide-react"

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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Вход в аккаунт</h1>
          <p className="text-neutral-400">Введите вашу seed-фразу из 12 слов для входа</p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-3">
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {seedWords.map((word, index) => (
              <div key={index} className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">{index + 1}.</span>
                <Input
                  value={word}
                  onChange={(e) => handleWordChange(index, e.target.value)}
                  onPaste={handlePaste}
                  placeholder="слово"
                  className="pl-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>

          <div className="bg-neutral-950 rounded-xl p-4 mb-6 border border-neutral-800">
            <p className="text-neutral-400 text-sm">💡 Вы можете вставить все 12 слов одновременно через Ctrl+V</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Назад
            </Button>
            <Button onClick={handleLogin} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-2" />
              Войти
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-neutral-500 text-sm">Ваша seed-фраза надежно хранится локально</p>
        </div>
      </div>
    </div>
  )
}
