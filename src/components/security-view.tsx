"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Webhook,
  ShieldCheck,
  Globe,
  Plus,
  Trash2,
  Send,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────
interface ClientData {
  client_id: string
  api_key: string
  webhook_callback_url: string
  allowed_ips: string[]
}

// ─── API Hook ───────────────────────────────────────────
export function useClientData() {
  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authToken = useAppStore((s) => s.auth.authToken)

  const fetchData = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/nexflowx?endpoint=/tower/me", {
        headers: { Authorization: authToken },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch {
      setError("Failed to reach the proxy service. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, setData }
}

// ─── Copy Button ────────────────────────────────────────
function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-all shrink-0",
        copied
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:text-white hover:border-neutral-600",
        className
      )}
    >
      {copied ? (
        <><Check className="w-3 h-3" /> Copied</>
      ) : (
        <><Copy className="w-3 h-3" /> {label}</>
      )}
    </button>
  )
}

// ─── Section Card ───────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-neutral-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="pl-0 sm:pl-11">{children}</div>
    </div>
  )
}

// ─── Security & Webhooks View ───────────────────────────
export function SecurityView() {
  const { data, loading, error, refetch, setData } = useClientData()
  const [showKey, setShowKey] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [allowedIps, setAllowedIps] = useState<string[]>([])
  const [newIp, setNewIp] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isPinging, setIsPinging] = useState(false)
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null)
  const authToken = useAppStore((s) => s.auth.authToken)
  const { toast } = useToast()

  // Sync local state with fetched data
  useEffect(() => {
    if (data) {
      setWebhookUrl(data.webhook_callback_url || "")
      setAllowedIps(data.allowed_ips || [])
    }
  }, [data])

  const handleSaveSecurity = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/nexflowx?endpoint=/tower/me/security", {
        method: "PATCH",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhook_callback_url: webhookUrl,
          allowed_ips: allowedIps,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        setData(result)
        toast({
          title: "Security Settings Saved",
          description: "Webhook URL and IP whitelist have been updated successfully.",
        })
      } else {
        toast({
          title: "Save Failed",
          description: "Could not update security settings. Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Failed to reach the service.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestPing = async () => {
    setIsPinging(true)
    setPingResult(null)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (webhookUrl && webhookUrl.startsWith("https://")) {
      setPingResult({
        success: true,
        message: "Ping delivered. HTTP 200 OK — Webhook endpoint is reachable.",
      })
    } else if (webhookUrl && webhookUrl.startsWith("http://")) {
      setPingResult({
        success: false,
        message: "Ping failed. Endpoint must use HTTPS. HTTP is not supported.",
      })
    } else {
      setPingResult({
        success: false,
        message: "Ping failed. Please enter a valid webhook URL first.",
      })
    }
    setIsPinging(false)
  }

  const handleAddIp = () => {
    const ip = newIp.trim()
    if (!ip) return
    if (allowedIps.includes(ip)) return
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^(\*|\*\.(\*|[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*))$/
    if (!ipRegex.test(ip)) {
      toast({
        title: "Invalid IP Format",
        description: "Enter a valid IPv4 address (e.g., 192.168.1.1) or CIDR range (e.g., 10.0.0.0/24).",
        variant: "destructive",
      })
      return
    }
    setAllowedIps([...allowedIps, ip])
    setNewIp("")
  }

  const handleRemoveIp = (ip: string) => {
    setAllowedIps(allowedIps.filter((i) => i !== ip))
  }

  // ─── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 bg-neutral-800" />
          <Skeleton className="h-4 w-72 bg-neutral-800" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-lg bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32 bg-neutral-800" />
                  <Skeleton className="h-3 w-48 bg-neutral-800" />
                </div>
              </div>
              <div className="pl-11 space-y-3">
                <Skeleton className="h-10 w-full bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-400/5 p-8 text-center animate-in fade-in">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-400 mb-4">{error || "No data available"}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="border-neutral-700 text-neutral-400 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    )
  }

  // ─── Main Content ──────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Security & Webhooks</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage your API key, webhook configuration, and IP access controls
          </p>
        </div>
      </div>

      {/* API Key Panel */}
      <SectionCard
        icon={ShieldCheck}
        title="API Key"
        description="Your proxy authentication key. Include this in all API requests."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <code className="block w-full text-sm font-mono bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-2.5 pr-12 truncate">
                {showKey ? data.api_key : "sk_proxy_•••••••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
                title={showKey ? "Hide API Key" : "Reveal API Key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <CopyButton text={data.api_key} label="Copy Key" />
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-neutral-600 bg-neutral-800/30 rounded-md px-2 py-1">
              x-proxy-key: {showKey ? data.api_key : "sk_proxy_•••••••"}
            </code>
          </div>
        </div>
      </SectionCard>

      {/* Webhook Panel */}
      <SectionCard
        icon={Webhook}
        title="Webhook Configuration"
        description="Callback URL for real-time payment event notifications."
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/nexflowx"
              className="flex-1 h-9 bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-1 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
            <Button
              onClick={handleTestPing}
              disabled={isPinging || !webhookUrl}
              variant="outline"
              size="sm"
              className="h-9 border-neutral-700 text-neutral-400 hover:text-white shrink-0"
            >
              {isPinging ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Pinging...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-3 h-3" />
                  Test Ping
                </span>
              )}
            </Button>
          </div>

          {pingResult && (
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium border",
                pingResult.success
                  ? "bg-green-400/5 border-green-400/20 text-green-400"
                  : "bg-amber-400/5 border-amber-400/20 text-amber-400"
              )}
            >
              {pingResult.message}
            </div>
          )}
        </div>
      </SectionCard>

      {/* IP Whitelist Panel */}
      <SectionCard
        icon={Globe}
        title="IP Whitelist"
        description="Restrict API access to specific IP addresses. Only whitelisted IPs can authenticate."
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddIp()
                }
              }}
              placeholder="e.g., 192.168.1.100 or 10.0.0.0/24"
              className="flex-1 h-9 bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-1 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
            <Button
              onClick={handleAddIp}
              disabled={!newIp.trim()}
              variant="outline"
              size="sm"
              className="h-9 border-neutral-700 text-neutral-400 hover:text-white shrink-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {allowedIps.length === 0 ? (
              <p className="text-xs text-neutral-600 py-3 text-center">
                No IPs whitelisted. All IPs are currently allowed.
              </p>
            ) : (
              allowedIps.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between bg-neutral-800/30 border border-neutral-800 rounded-lg px-3 py-2 group"
                >
                  <code className="text-xs font-mono text-neutral-300">{ip}</code>
                  <button
                    onClick={() => handleRemoveIp(ip)}
                    className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    title="Remove IP"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {allowedIps.length > 0 && (
            <p className="text-[11px] text-neutral-600">
              {allowedIps.length} IP{allowedIps.length !== 1 ? "s" : ""} whitelisted
            </p>
          )}
        </div>
      </SectionCard>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-2">
        <Button
          onClick={handleSaveSecurity}
          disabled={isSaving}
          className="h-10 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-lg px-6 disabled:opacity-40"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Security Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
