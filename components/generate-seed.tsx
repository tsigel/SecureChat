"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, Eye, EyeOff } from "lucide-react"

interface GenerateSeedProps {
  seedPhrase: string[]
  onNext: () => void
}

export function GenerateSeed({ seedPhrase, onNext }: GenerateSeedProps) {
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(seedPhrase.join(" "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-card border-border">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Запишите seed-фразу</h1>
          <p className="text-sm text-muted-foreground">
            Эта фраза из 12 слов - единственный способ восстановить доступ к вашему аккаунту. Храните её в безопасном
            месте и никому не показывайте.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Ваша seed-фраза:</p>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)} className="gap-2">
              {isVisible ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Скрыть
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Показать
                </>
              )}
            </Button>
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-6">
            {isVisible ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {seedPhrase.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-background border border-border rounded-md p-3"
                  >
                    <span className="text-xs text-muted-foreground font-mono w-6">{index + 1}.</span>
                    <span className="text-sm font-medium text-foreground font-mono">{word}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Фраза скрыта</p>
              </div>
            )}
          </div>

          <Button variant="outline" onClick={handleCopy} className="w-full gap-2 bg-transparent">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Скопировано
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Скопировать фразу
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4 pt-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium">⚠️ Важно!</p>
            <ul className="text-sm text-destructive/90 mt-2 space-y-1 list-disc list-inside">
              <li>Никогда не делитесь этой фразой с другими</li>
              <li>Запишите её на бумаге и храните в безопасном месте</li>
              <li>Без этой фразы вы не сможете восстановить доступ</li>
            </ul>
          </div>

          <Button onClick={onNext} className="w-full">
            Я записал seed-фразу, продолжить
          </Button>
        </div>
      </Card>
    </div>
  )
}
