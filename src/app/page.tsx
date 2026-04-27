"use client"

import { useAppStore } from "@/lib/store"
import { LoginScreen } from "@/components/login-screen"
import { AppShell } from "@/components/app-shell"

export default function HomePage() {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated)

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <AppShell />
}
