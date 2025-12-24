"use client"

import { useState, useEffect } from "react"
import { GenerateSeed } from "./generate-seed"
import { ConfirmSeed } from "./confirm-seed"
import { generateSeedPhrase } from "@/lib/seed"

type OnboardingStep = "generate" | "confirm"

interface OnboardingFlowProps {
  onComplete: () => void
  onCancel?: () => void
}

export function OnboardingFlow({ onComplete, onCancel }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("generate")
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])

  useEffect(() => {
    const seed = generateSeedPhrase()
    setSeedPhrase(seed)
    localStorage.setItem("messenger_seed", JSON.stringify(seed))
  }, [])

  const updateSeedPhrase = (seed: string[]) => {
    setSeedPhrase(seed)
    localStorage.setItem("messenger_seed", JSON.stringify(seed))
  }

  const handleRegenerateSeed = () => {
    updateSeedPhrase(generateSeedPhrase())
  }

  const handleConfirmSeed = () => {
    setStep("confirm")
  }

  const handleBackToGenerate = () => {
    setStep("generate")
  }

  const handleComplete = () => {
    localStorage.setItem("messenger_seed_verified", "true")
    onComplete()
  }

  if (seedPhrase.length === 0) {
    return null // Or a loading spinner
  }

  if (step === "generate") {
    return (
      <GenerateSeed
        seedPhrase={seedPhrase}
        onNext={handleConfirmSeed}
        onSeedChange={updateSeedPhrase}
        onRegenerate={handleRegenerateSeed}
        onCancel={onCancel}
      />
    )
  }

  return <ConfirmSeed seedPhrase={seedPhrase} onComplete={handleComplete} onBack={handleBackToGenerate} />
}
