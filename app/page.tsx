"use client"

import { useState, useEffect } from "react"
import { MessengerInterface } from "@/components/messenger-interface"
import { AuthWrapper } from "@/components/auth-wrapper"

export default function Page() {
  const [hasAccount, setHasAccount] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const account = localStorage.getItem("messenger_seed_verified")
    setHasAccount(!!account)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null
  }

  if (!hasAccount) {
    return <AuthWrapper onComplete={() => setHasAccount(true)} />
  }

  return <MessengerInterface />
}
