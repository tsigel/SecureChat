"use client"

import { useState } from "react"
import { CreateAccount } from "./create-account"
import { GenerateSeed } from "./generate-seed"
import { ConfirmSeed } from "./confirm-seed"

type OnboardingStep = "welcome" | "generate" | "confirm"

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome")
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])

  const handleGenerateSeed = (seed: string[]) => {
    setSeedPhrase(seed)
    localStorage.setItem("messenger_seed", JSON.stringify(seed))
    setStep("generate")
  }

  const handleConfirmSeed = () => {
    setStep("confirm")
  }

  const handleComplete = () => {
    localStorage.setItem("messenger_seed_verified", "true")
    onComplete()
  }

  if (step === "welcome") {
    return <CreateAccount onNext={handleGenerateSeed} />
  }

  if (step === "generate") {
    return <GenerateSeed seedPhrase={seedPhrase} onNext={handleConfirmSeed} />
  }

  return <ConfirmSeed seedPhrase={seedPhrase} onComplete={handleComplete} />
}
