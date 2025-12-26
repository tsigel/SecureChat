"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface ConfirmSeedProps {
  seedPhrase: string[]
  onComplete: () => void
  onBack?: () => void
}

export function ConfirmSeed({ seedPhrase, onComplete, onBack }: ConfirmSeedProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    // Shuffle the seed phrase words
    const shuffled = [...seedPhrase].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
  }, [seedPhrase])

  const handleWordClick = (word: string) => {
    if (selectedWords.length < 12) {
      setSelectedWords([...selectedWords, word])
      setShuffledWords(shuffledWords.filter((w) => w !== word))
      setError(false)
    }
  }

  const handleRemoveWord = (index: number) => {
    const word = selectedWords[index]
    setSelectedWords(selectedWords.filter((_, i) => i !== index))
    setShuffledWords([...shuffledWords, word])
    setError(false)
  }

  const handleVerify = () => {
    const isCorrect = selectedWords.every((word, index) => word === seedPhrase[index])

    if (isCorrect && selectedWords.length === 12) {
      onComplete()
    } else {
      setError(true)
    }
  }

  const isComplete = selectedWords.length === 12

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-card border-border">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Подтвердите seed-фразу</h1>
          <p className="text-sm text-muted-foreground">
            Выберите слова в правильном порядке, чтобы подтвердить, что вы записали фразу.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Выбранные слова: {selectedWords.length}/12</p>
            <div className="min-h-[120px] bg-secondary/50 border border-border rounded-lg p-4">
              {selectedWords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedWords.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleRemoveWord(index)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <span className="text-xs opacity-70">{index + 1}.</span>
                      {word}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Выберите слова ниже</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">Неправильный порядок слов. Попробуйте еще раз.</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Доступные слова:</p>
            <div className="flex flex-wrap gap-2">
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordClick(word)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:border-accent-foreground transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">

          {onBack && (
            <Button variant="ghost" onClick={onBack} className="w-full sm:flex-1">
              Назад
            </Button>
          )}
          <Button onClick={handleVerify} disabled={!isComplete} className="w-full sm:flex-1">
            Подтвердить и продолжить
          </Button>
          </div>
      </Card>
    </div>
  )
}
