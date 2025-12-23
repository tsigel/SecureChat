"use client"

import { useState } from "react"
import { OnboardingFlow } from "./onboarding-flow"
import { LoginSeed } from "./login-seed"
import { LandingPage } from "./landing-page"

interface AuthWrapperProps {
  onComplete: () => void
}

type AuthMode = "landing" | "create" | "login"

export function AuthWrapper({ onComplete }: AuthWrapperProps) {
  const [mode, setMode] = useState<AuthMode>("landing")

  if (mode === "create") {
    return <OnboardingFlow onComplete={onComplete} />
  }

  if (mode === "login") {
    return <LoginSeed onLogin={onComplete} onBack={() => setMode("landing")} />
  }

  return <LandingPage onCreateAccount={() => setMode("create")} onLogin={() => setMode("login")} />
}
