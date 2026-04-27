"use client"

import { useAppStore } from "@/lib/store"
import { LoginScreen } from "@/components/login-screen"
import { SecurityView } from "@/components/security-view"
import { HubView } from "@/components/hub-view"
import { DocsView } from "@/components/docs-view"
import {
  LogOut,
  ShieldCheck,
  Puzzle,
  BookOpen,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AppShell() {
  const { auth, logout, activeView, setActiveView } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/[0.02] rounded-full blur-[128px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <img src="/favicon.svg" alt="NeXFlowX" className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight hidden sm:inline">
                NeXFlowX
              </span>
              <span className="text-neutral-800 hidden sm:inline">|</span>
              <span className="text-sm text-neutral-400 hidden sm:inline">
                Developer Portal
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-900/50 rounded-lg px-2.5 py-1.5 border border-neutral-800">
                <User className="w-3 h-3" />
                <span className="font-mono">{auth.username}</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-400/5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="sticky top-14 z-40 border-b border-neutral-800 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12">
            <button
              onClick={() => setActiveView("security")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeView === "security"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Security & Webhooks
            </button>
            <button
              onClick={() => setActiveView("hub")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeView === "hub"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Puzzle className="w-3.5 h-3.5" />
              Integration Hub
            </button>
            <button
              onClick={() => setActiveView("docs")}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeView === "docs"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {activeView === "security" ? <SecurityView /> : activeView === "hub" ? <HubView /> : <DocsView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800 bg-[#0A0A0A] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-neutral-600">
              NeXFlowX Developer Portal &middot; Self-Service Infrastructure Management
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-700 font-mono">v3.0.0</span>
              <span className="text-neutral-800">&middot;</span>
              <span className="text-[11px] text-neutral-700">
                &copy; {new Date().getFullYear()} NeXFlowX Technologies
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
