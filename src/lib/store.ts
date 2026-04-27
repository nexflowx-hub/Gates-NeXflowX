"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthState {
  isAuthenticated: boolean
  username: string
  password: string
  authToken: string
}

type ProviderId = "viva" | "sibs" | "stripe" | "mollie" | "sepa" | "eupago" | "pix" | "crypto"
type FamilyId = "stripe" | "sibs" | "eupago" | "viva" | "sepa" | "mollie" | "brasil" | "crypto"
type ViewMode = "card" | "list"

interface AppState {
  auth: AuthState
  login: (username: string, password: string) => boolean
  logout: () => void
  activeView: "security" | "hub" | "docs" | "viva-countries"
  setActiveView: (view: "security" | "hub" | "docs" | "viva-countries") => void
  hubSelectedFamily: FamilyId | null
  setHubSelectedFamily: (family: FamilyId | null) => void
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  selectedDocsProvider: ProviderId | null
  setSelectedDocsProvider: (provider: ProviderId | null) => void
  hubViewMode: ViewMode
  setHubViewMode: (mode: ViewMode) => void
}

const AUTH_USERNAME = "NEXOR"
const AUTH_PASSWORD = "NEXOR13467928*.*"

function encodeBasicAuth(username: string, password: string): string {
  return "Basic " + btoa(`${username}:${password}`)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      auth: {
        isAuthenticated: false,
        username: "",
        password: "",
        authToken: "",
      },
      login: (username: string, password: string) => {
        if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
          const token = encodeBasicAuth(username, password)
          set({
            auth: {
              isAuthenticated: true,
              username,
              password,
              authToken: token,
            },
          })
          return true
        }
        return false
      },
      logout: () => {
        set({
          auth: {
            isAuthenticated: false,
            username: "",
            password: "",
            authToken: "",
          },
          selectedNodeId: null,
        })
      },
      activeView: "security",
      setActiveView: (view) => set({ activeView: view, selectedNodeId: null, selectedDocsProvider: null, hubSelectedFamily: null }),
      selectedNodeId: null,
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      selectedDocsProvider: null,
      setSelectedDocsProvider: (provider) => set({ selectedDocsProvider: provider }),
      hubSelectedFamily: null,
      setHubSelectedFamily: (family) => set({ hubSelectedFamily: family }),
      hubViewMode: "card",
      setHubViewMode: (mode) => set({ hubViewMode: mode }),
    }),
    {
      name: "nexflowx-auth",
      partialize: (state) => ({
        auth: state.auth,
        hubViewMode: state.hubViewMode,
      }),
    }
  )
)

export type { ProviderId, ViewMode, FamilyId }
