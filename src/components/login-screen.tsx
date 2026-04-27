"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ChevronRight } from "lucide-react"

export function LoginScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const login = useAppStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const success = login(username, password)
    if (!success) {
      setError("Invalid credentials. Access denied.")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/3 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4">
            <img src="/favicon.svg" alt="NeXFlowX" className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            NeXFlowX
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Developer Portal</p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-400">
              Authentication Required
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Client ID
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your client ID"
                className="h-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-600 font-mono text-sm focus-visible:border-green-500/50 focus-visible:ring-green-500/20"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Access Key
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your access key"
                className="h-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-600 font-mono text-sm focus-visible:border-green-500/50 focus-visible:ring-green-500/20"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-lg transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Access Developer Portal
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Secure developer access only. All API calls are monitored and rate-limited.
        </p>
      </div>
    </div>
  )
}
