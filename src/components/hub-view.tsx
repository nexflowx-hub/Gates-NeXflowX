"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAppStore, type ProviderId, type ViewMode } from "@/lib/store"
import { useClientData } from "@/components/security-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  List,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Server,
  X,
  Key,
  Terminal,
  ChevronRight,
  Info,
  Route,
  CreditCard,
  Smartphone,
  Globe,
  Wallet,
  Zap,
  ArrowRight,
  Lock,
  BookOpen,
  Shield,
  Send,
  Landmark,
  CircleDot,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────
interface PaymentNode {
  id: string
  name: string
  public_key: string
  lifecycle_status?: string
}

interface NodesData {
  nodes: PaymentNode[]
}

interface CapabilityNode {
  node_id: string
  methods: string[]
  currencies: string[]
  public_key: string
  integration_type: "PASS_THROUGH" | "NATIVE"
  region?: string
}

interface CapabilitiesData {
  nodes: CapabilityNode[]
}

interface EnrichedNode extends PaymentNode {
  methods: string[]
  currencies: string[]
  integrationType: "PASS_THROUGH" | "NATIVE" | "UNKNOWN"
  region: string
  hasCapabilities: boolean
}

// ─── API Hooks ──────────────────────────────────────────
function useNodesData() {
  const [data, setData] = useState<NodesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authToken = useAppStore((s) => s.auth.authToken)

  const fetchData = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/nexflowx?endpoint=/tower/nodes", {
        headers: { Authorization: authToken },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch {
      setError("Failed to reach the proxy service.")
    } finally {
      setLoading(false)
    }
  }, [authToken])

  useEffect(() => { fetchData() }, [fetchData])
  return { data, loading, error, refetch: fetchData }
}

function useCapabilitiesData() {
  const [data, setData] = useState<CapabilitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authToken = useAppStore((s) => s.auth.authToken)

  const fetchData = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/nexflowx?endpoint=/relay/capabilities", {
        headers: { Authorization: authToken },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch {
      setError("Capabilities endpoint unreachable.")
    } finally {
      setLoading(false)
    }
  }, [authToken])

  useEffect(() => { fetchData() }, [fetchData])
  return { data, loading, error, refetch: fetchData }
}

// ─── Helpers ────────────────────────────────────────────
const PROXY_BASE = "https://proxy.nexflowx.tech"

function getProviderFromNode(nodeId: string): ProviderId | null {
  if (nodeId.includes("VIVA")) return "viva"
  if (nodeId.includes("SIBS")) return "sibs"
  if (nodeId.includes("STRIPE")) return "stripe"
  if (nodeId.includes("MOLLIE")) return "mollie"
  return null
}

function getNodeType(nodeId: string): string {
  if (nodeId.includes("SIBS_L_001")) return "MBWAY"
  if (nodeId.includes("SIBS_L_002")) return "MULTIBANCO"
  if (nodeId.includes("STRIPE")) return "STRIPE"
  if (nodeId.includes("MOLLIE")) return "MOLLIE"
  if (nodeId.includes("VIVA")) return "VIVA"
  return "GENERIC"
}

function getProviderColor(nodeId: string) {
  const type = getNodeType(nodeId)
  const colors: Record<string, { main: string; bg: string; border: string; glow: string }> = {
    MBWAY:    { main: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/20",   glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]" },
    MULTIBANCO: { main: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]" },
    STRIPE:   { main: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20",  glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]" },
    MOLLIE:   { main: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   glow: "shadow-[0_0_20px_rgba(251,191,36,0.15)]" },
    VIVA:     { main: "text-emerald-400",  bg: "bg-emerald-400/10",  border: "border-emerald-400/20",  glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]" },
    GENERIC:  { main: "text-neutral-400",  bg: "bg-neutral-800",     border: "border-neutral-700",     glow: "" },
  }
  return colors[type] || colors.GENERIC
}

function getMethodIcon(method: string) {
  const m = method.toUpperCase()
  if (m.includes("CARD") || m.includes("CREDIT") || m.includes("DEBIT")) return CreditCard
  if (m.includes("MBWAY") || m.includes("MB WAY")) return Smartphone
  if (m.includes("APPLE") || m.includes("GOOGLE") || m.includes("WALLET")) return Wallet
  if (m.includes("PIX")) return Zap
  if (m.includes("CRYPTO") || m.includes("BTC") || m.includes("ETH")) return Lock
  if (m.includes("BANK") || m.includes("SEPA") || m.includes("TRANSFER")) return Landmark
  if (m.includes("IDEAL")) return Globe
  if (m.includes("MULTIBANCO") || m.includes("REF")) return Landmark
  return CircleDot
}

function getRegion(nodeId: string): string {
  if (nodeId.includes("_PT_") || nodeId.includes("_PORTUGAL")) return "PT"
  if (nodeId.includes("_ES_") || nodeId.includes("_SPAIN")) return "ES"
  if (nodeId.includes("_UK_") || nodeId.includes("_GB_")) return "UK"
  if (nodeId.includes("_NL_") || nodeId.includes("_NETHERLANDS")) return "NL"
  if (nodeId.includes("_BR_") || nodeId.includes("_BRAZIL")) return "BR"
  if (nodeId.includes("_DE_") || nodeId.includes("_GERMANY")) return "DE"
  return "EU"
}

function isOperational(node: PaymentNode): boolean {
  return node.lifecycle_status === "ACTIVE" || node.lifecycle_status === "OPERATIONAL" || !node.lifecycle_status
}

// ─── Copy Button ────────────────────────────────────────
function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all shrink-0",
      copied ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-neutral-700 bg-neutral-800/50 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600",
      className
    )}>
      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> {label}</>}
    </button>
  )
}

// ─── Snippet generator ─────────────────────────────────
function getNodeSnippet(node: PaymentNode, apiKey: string) {
  const nodeType = getNodeType(node.id)
  const relayPath = `${PROXY_BASE}/relay/${node.id}/payments`
  const proxyKey = apiKey || "<YOUR_PROXY_KEY>"

  const snippets: Record<string, { curl: string; note?: string; endpoint: string; method: string; responseExample?: string }> = {
    MBWAY: {
      method: "POST", endpoint: relayPath,
      curl: `curl -X POST ${relayPath} \\\n  -H "Content-Type: application/json" \\\n  -H "x-proxy-key: ${proxyKey}" \\\n  -d '{\n    "amount": 10.50,\n    "phone": "351912345678",\n    "reference": "REF123"\n  }'`,
      responseExample: JSON.stringify({ status: "PENDING", orderId: "3439172051138938", message: "Valide o pagamento na sua App MB WAY." }, null, 2),
      note: "Dispara notificação push. Confirmação via webhook.",
    },
    MULTIBANCO: {
      method: "POST", endpoint: relayPath,
      curl: `curl -X POST ${relayPath} \\\n  -H "Content-Type: application/json" \\\n  -H "x-proxy-key: ${proxyKey}" \\\n  -d '{\n    "amount": 25.00,\n    "reference": "INV-456"\n  }'`,
      responseExample: JSON.stringify({ status: "PENDING", entity: "11249", reference: "872192941", amount: 25.00, currency: "EUR" }, null, 2),
      note: "Gera Entidade e Referência para pagamento em ATM.",
    },
    STRIPE: {
      method: "POST", endpoint: relayPath,
      curl: `curl -X POST ${relayPath} \\\n  -H "Content-Type: application/json" \\\n  -H "x-proxy-key: ${proxyKey}" \\\n  -d '{\n    "amount": 2000,\n    "currency": "gbp",\n    "payment_method_types[]": "card"\n  }'`,
      responseExample: JSON.stringify({ id: "pi_3NqxYz", object: "payment_intent", status: "requires_payment_method", amount: 2000, currency: "gbp" }, null, 2),
      note: "Relay universal Stripe. O sistema injeta a chave secreta automaticamente.",
    },
    MOLLIE: {
      method: "POST", endpoint: relayPath,
      curl: `curl -X POST ${relayPath} \\\n  -H "Content-Type: application/json" \\\n  -H "x-proxy-key: ${proxyKey}" \\\n  -d '{\n    "amount": { "currency": "EUR", "value": "10.00" },\n    "description": "Order #12345",\n    "redirectUrl": "https://yourdomain.com/return"\n  }'`,
      responseExample: JSON.stringify({ id: "tr_7UhSN1zuXS", resource: "payment", status: "open", _links: { checkout: { href: "https://www.mollie.com/checkout/select-method/7UhSN1zuXS" } } }, null, 2),
      note: "Webhook Enrichment automático pelo Proxy.",
    },
    VIVA: {
      method: "POST", endpoint: `${PROXY_BASE}/relay/${node.id}/checkout/v2/orders`,
      curl: `curl -X POST ${PROXY_BASE}/relay/${node.id}/checkout/v2/orders \\\n  -H "Content-Type: application/json" \\\n  -H "x-proxy-key: ${proxyKey}" \\\n  -d '{\n    "amount": 2500,\n    "reference": "ORD-2026-001",\n    "customerTrns": "Pagamento Fatura #ORD-2026-001",\n    "sourceCode": "8851"\n  }'`,
      responseExample: JSON.stringify({ orderCode: 4160204319947614 }, null, 2),
      note: "Smart Checkout Pass-Through. Viva gere PCI-DSS, Apple Pay, Google Pay, MB WAY.",
    },
    GENERIC: {
      method: "POST", endpoint: `${PROXY_BASE}/relay/${node.id}/payments`,
      curl: `curl -X POST ${PROXY_BASE}/relay/${node.id}/payments \\\n  -H "Content-Type: application/json" \\\n  -H "x-proxy-key: ${proxyKey}" \\\n  -d '{}'`,
    },
  }
  return snippets[nodeType] || snippets.GENERIC
}

function getJsonPayload(nodeId: string): string {
  const type = getNodeType(nodeId)
  switch (type) {
    case "MBWAY": return JSON.stringify({ amount: 10.50, phone: "351912345678", reference: "REF123" }, null, 2)
    case "MULTIBANCO": return JSON.stringify({ amount: 25.00, reference: "INV-456" }, null, 2)
    case "STRIPE": return JSON.stringify({ amount: 2000, currency: "gbp", "payment_method_types[]": "card" }, null, 2)
    case "MOLLIE": return JSON.stringify({ amount: { currency: "EUR", value: "10.00" }, description: "Order #12345", redirectUrl: "https://yourdomain.com/return" }, null, 2)
    case "VIVA": return JSON.stringify({ amount: 2500, reference: "ORD-2026-001", customerTrns: "Pagamento Fatura #ORD-2026-001", sourceCode: "8851" }, null, 2)
    default: return "{}"
  }
}

// ─── Framer Motion Variants ─────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
}

const listRowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.15 } },
}

// ─── Node Card ──────────────────────────────────────────
function NodeCard({
  node,
  enriched,
  index,
  onNavigate,
}: {
  node: PaymentNode
  enriched: EnrichedNode
  index: number
  onNavigate: () => void
}) {
  const colors = getProviderColor(node.id)
  const operational = isOperational(node)
  const onboarding = node.lifecycle_status === "ONBOARDING"
  const maintenance = node.lifecycle_status === "MAINTENANCE"
  const hasPublicKey = node.public_key && node.public_key !== "N/A"
  const provider = getProviderFromNode(node.id)
  const hasDocs = provider === "viva" // Currently only VIVA has docs

  return (
    <motion.button
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onNavigate}
      disabled={onboarding || maintenance}
      className={cn(
        "w-full text-left rounded-xl border transition-all duration-300 relative overflow-hidden group",
        // Operational glow
        operational && colors.glow && `border-[${colors.main.replace('text-', '')}]/20`,
        operational && !onboarding && !maintenance ? "hover:border-neutral-600" : "",
        onboarding || maintenance ? "opacity-50 grayscale-[40%]" : "",
        onboarding && "cursor-not-allowed",
        !operational && !onboarding && "border-neutral-800/80 opacity-70",
      )}
    >
      {/* Top accent line for operational */}
      {operational && !onboarding && !maintenance && (
        <div className={cn("absolute top-0 left-0 right-0 h-px", colors.bg.replace('/10', '/30'))} style={{
          background: `linear-gradient(90deg, transparent, ${enriched.integrationType === 'NATIVE' ? '#00ffcc' : '#a78bfa'}, transparent)`,
          opacity: 0.4,
        }} />
      )}

      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn("mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors", colors.bg, colors.border)}>
              <Server className={cn("w-4 h-4", colors.main)} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{node.name}</h3>
              <p className="text-[11px] font-mono text-neutral-500 mt-0.5 truncate">{node.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {/* Status badge */}
            {operational && !onboarding && (
              <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(34,197,94,0.15)]">
                OPERACIONAL
              </span>
            )}
            {onboarding && (
              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 animate-pulse">
                ONBOARDING
              </span>
            )}
            {maintenance && (
              <span className="text-[9px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-2 py-0.5">
                MAINTENANCE
              </span>
            )}
            {/* PK indicator */}
            {!onboarding && hasPublicKey && (
              <span className="text-[9px] font-medium text-violet-400/80 bg-violet-400/5 border border-violet-400/10 rounded-full px-1.5 py-0.5">
                PK
              </span>
            )}
          </div>
        </div>

        {/* Integration type + Region */}
        <div className="flex items-center gap-2 mt-3">
          <span className={cn(
            "text-[9px] font-bold border rounded px-1.5 py-0.5",
            enriched.integrationType === "NATIVE"
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : enriched.integrationType === "PASS_THROUGH"
                ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
                : "text-neutral-600 bg-neutral-800 border-neutral-700"
          )}>
            {enriched.integrationType === "NATIVE" ? "NATIVE" : enriched.integrationType === "PASS_THROUGH" ? "PASS_THROUGH" : "—"}
          </span>
          <span className="text-[9px] font-medium text-neutral-600 bg-neutral-800/50 border border-neutral-800 rounded px-1.5 py-0.5">
            {enriched.region}
          </span>
          {hasDocs && (
            <span className="text-[9px] font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded px-1.5 py-0.5 ml-auto flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" /> Docs
            </span>
          )}
        </div>

        {/* Methods row */}
        {enriched.hasCapabilities && enriched.methods.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {enriched.methods.slice(0, 5).map((method) => {
              const MIcon = getMethodIcon(method)
              return (
                <span
                  key={method}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-800/60 border border-neutral-800 rounded-md px-1.5 py-0.5"
                >
                  <MIcon className="w-2.5 h-2.5" />
                  {method.toUpperCase()}
                </span>
              )
            })}
            {enriched.methods.length > 5 && (
              <span className="text-[10px] text-neutral-600">+{enriched.methods.length - 5}</span>
            )}
          </div>
        )}

        {/* Currencies */}
        {enriched.hasCapabilities && enriched.currencies.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {enriched.currencies.map((c) => (
              <span key={c} className="text-[9px] font-mono font-medium text-neutral-500 bg-neutral-900/80 border border-neutral-800 rounded px-1.5 py-0.5">
                {c.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Onboarding notice */}
        {onboarding && (
          <div className="mt-3 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-[11px] text-amber-400">Aguardando clearance técnico</span>
          </div>
        )}
      </div>
    </motion.button>
  )
}

// ─── List Row ───────────────────────────────────────────
function NodeListRow({
  node,
  enriched,
  index,
  onNavigate,
}: {
  node: PaymentNode
  enriched: EnrichedNode
  index: number
  onNavigate: () => void
}) {
  const colors = getProviderColor(node.id)
  const operational = isOperational(node)
  const onboarding = node.lifecycle_status === "ONBOARDING"
  const maintenance = node.lifecycle_status === "MAINTENANCE"
  const hasPublicKey = node.public_key && node.public_key !== "N/A"
  const provider = getProviderFromNode(node.id)
  const hasDocs = provider === "viva"

  return (
    <motion.button
      custom={index}
      variants={listRowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      onClick={onNavigate}
      disabled={onboarding || maintenance}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-neutral-800/50 transition-all flex items-center gap-4",
        onboarding || maintenance ? "opacity-50 grayscale-[40%] cursor-not-allowed" : "hover:bg-white/[0.02]",
        !operational && !onboarding && "opacity-70",
      )}
    >
      {/* Node icon */}
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", colors.bg, colors.border)}>
        <Server className={cn("w-3.5 h-3.5", colors.main)} />
      </div>

      {/* Name + ID */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white truncate">{node.name}</p>
        <p className="text-[10px] font-mono text-neutral-600 truncate">{node.id}</p>
      </div>

      {/* Status */}
      <div className="shrink-0 hidden sm:block">
        {operational && !onboarding && (
          <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
            OPERACIONAL
          </span>
        )}
        {onboarding && (
          <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 animate-pulse">
            ONBOARDING
          </span>
        )}
        {maintenance && (
          <span className="text-[9px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-2 py-0.5">
            MAINTENANCE
          </span>
        )}
      </div>

      {/* Region */}
      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-800/50 border border-neutral-800 rounded px-2 py-0.5 shrink-0 hidden md:block">
        {enriched.region}
      </span>

      {/* Integration Type */}
      <span className={cn(
        "text-[9px] font-bold border rounded px-1.5 py-0.5 shrink-0 hidden lg:block",
        enriched.integrationType === "NATIVE"
          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
          : enriched.integrationType === "PASS_THROUGH"
            ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
            : "text-neutral-600 bg-neutral-800 border-neutral-700"
      )}>
        {enriched.integrationType === "NATIVE" ? "NATIVE" : enriched.integrationType === "PASS_THROUGH" ? "PASS_THROUGH" : "—"}
      </span>

      {/* Methods pills */}
      <div className="hidden lg:flex items-center gap-1 shrink-0 max-w-[200px] overflow-hidden">
        {enriched.methods.slice(0, 3).map((m) => {
          const MI = getMethodIcon(m)
          return (
            <span key={m} className="inline-flex items-center gap-0.5 text-[9px] text-neutral-500 bg-neutral-800/60 border border-neutral-800 rounded px-1 py-0.5 whitespace-nowrap">
              <MI className="w-2.5 h-2.5" />{m.toUpperCase()}
            </span>
          )
        })}
        {enriched.methods.length > 3 && <span className="text-[9px] text-neutral-600">+{enriched.methods.length - 3}</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {hasPublicKey && <span className="text-[9px] font-medium text-violet-400/70 bg-violet-400/5 border border-violet-400/10 rounded px-1.5 py-0.5 hidden sm:inline">PK</span>}
        {hasDocs && <BookOpen className="w-3 h-3 text-cyan-400/60" />}
        <ChevronRight className="w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-400 transition-colors" />
      </div>
    </motion.button>
  )
}

// ─── Side Panel ─────────────────────────────────────────
function SidePanel({
  node,
  enriched,
  apiKey,
  onClose,
  onGoToDocs,
}: {
  node: PaymentNode
  enriched: EnrichedNode
  apiKey: string
  onClose: () => void
  onGoToDocs: () => void
}) {
  const snippet = useMemo(() => getNodeSnippet(node, apiKey), [node, apiKey])
  const colors = getProviderColor(node.id)
  const hasPublicKey = node.public_key && node.public_key !== "N/A"
  const jsonPayload = useMemo(() => getJsonPayload(node.id), [node.id])
  const provider = getProviderFromNode(node.id)
  const hasDocs = provider === "viva"

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex flex-col h-full"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", colors.bg, colors.border)}>
              <Server className={cn("w-4 h-4", colors.main)} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{node.name}</h3>
              <p className="text-[11px] font-mono text-neutral-500 truncate">{node.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasDocs && (
              <button
                onClick={onGoToDocs}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/10 transition-all"
              >
                <BookOpen className="w-3 h-3" />
                Ver Docs
              </button>
            )}
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Quick Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Route className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Quick Docs</span>
            </div>
            <div className="rounded-lg bg-neutral-900/50 border border-neutral-800 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Gateway Type</span>
                <span className={cn("text-xs font-semibold", colors.main)}>{getNodeType(node.id)}</span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Integration</span>
                <span className={cn(
                  "text-[10px] font-bold border rounded px-1.5 py-0.5",
                  enriched.integrationType === "NATIVE" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    : enriched.integrationType === "PASS_THROUGH" ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
                    : "text-neutral-600 bg-neutral-800 border-neutral-700"
                )}>
                  {enriched.integrationType}
                </span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Region</span>
                <span className="text-xs font-mono text-neutral-300">{enriched.region}</span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Method</span>
                <span className="text-xs font-mono text-neutral-300">{snippet.method}</span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Relay Path</span>
                <span className="text-[11px] font-mono text-neutral-400 truncate ml-3 max-w-[200px]" title={snippet.endpoint}>
                  {snippet.endpoint.replace(PROXY_BASE, "")}
                </span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Auth Header</span>
                <span className="text-[11px] font-mono text-green-400/70">x-proxy-key</span>
              </div>
            </div>
          </div>

          {/* Capabilities Methods */}
          {enriched.hasCapabilities && enriched.methods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Available Methods</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {enriched.methods.map((m) => {
                  const MI = getMethodIcon(m)
                  return (
                    <span key={m} className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-300 bg-neutral-800/60 border border-neutral-800 rounded-md px-2 py-1">
                      <MI className="w-3 h-3 text-neutral-500" /> {m.toUpperCase()}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Currencies */}
          {enriched.hasCapabilities && enriched.currencies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Currencies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {enriched.currencies.map((c) => (
                  <span key={c} className="text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-800/60 border border-neutral-800 rounded-md px-2 py-1">
                    {c.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Public Key */}
          {hasPublicKey && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Public Key</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-violet-400 bg-violet-400/5 border border-violet-400/10 rounded-lg px-3 py-2.5 break-all">
                  {node.public_key}
                </code>
                <CopyButton text={node.public_key} label="Copy" />
              </div>
            </div>
          )}

          {/* cURL Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">cURL Request</span>
              </div>
              <CopyButton text={snippet.curl} label="Copy cURL" />
            </div>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
              <pre className="p-3 text-[12px] font-mono text-neutral-300 leading-relaxed overflow-x-auto whitespace-pre">
                <code>{snippet.curl}</code>
              </pre>
            </div>
          </div>

          {/* JSON Payload */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-amber-400/20 border border-amber-400/30" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Request Payload</span>
              <CopyButton text={jsonPayload} label="Copy JSON" />
            </div>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
              <pre className="p-3 text-[12px] font-mono text-amber-300/80 leading-relaxed overflow-x-auto whitespace-pre">
                <code>{jsonPayload}</code>
              </pre>
            </div>
          </div>

          {/* Response Example */}
          {snippet.responseExample && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-sm bg-green-400/20 border border-green-400/30" />
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Response Example</span>
                <CopyButton text={snippet.responseExample} label="Copy" />
              </div>
              <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
                <pre className="p-3 text-[12px] font-mono text-green-300/70 leading-relaxed overflow-x-auto whitespace-pre">
                  <code>{snippet.responseExample}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Note */}
          {snippet.note && (
            <div className="flex gap-2.5 rounded-lg bg-green-400/5 border border-green-400/10 px-3.5 py-3">
              <Info className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-green-400/80 leading-relaxed">{snippet.note}</p>
            </div>
          )}

          {/* Webhook Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Route className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Webhook Delivery Format</span>
            </div>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
              <pre className="p-3 text-[12px] font-mono text-neutral-400 leading-relaxed overflow-x-auto whitespace-pre">
{JSON.stringify({
  source: "NeXFlowX-Proxy",
  route: node.id,
  payload: { /* enriched transaction data */ },
  timestamp: "2026-04-21T15:45:00Z"
}, null, 2)}
              </pre>
            </div>
            <p className="text-[11px] text-neutral-600">
              Events delivered to webhook_callback_url configured in Security & Webhooks.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── No Docs Toast ──────────────────────────────────────
function NoDocsToast({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)]"
    >
      <div className="rounded-xl border border-amber-400/20 bg-neutral-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">Documentação em Preparação</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              A documentação técnica para este provider ainda não está disponível no painel.
            </p>
            <p className="text-xs text-amber-400/80 mt-2">
              Para suporte imediato, contacte: <span className="font-semibold">Telegram @NeXFlowX_Support</span>
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Integration Hub View ───────────────────────────────
export function HubView() {
  const { data, loading, error, refetch } = useNodesData()
  const { data: capsData, loading: capsLoading } = useCapabilitiesData()
  const { data: clientData } = useClientData()
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId)
  const hubViewMode = useAppStore((s) => s.hubViewMode)
  const setHubViewMode = useAppStore((s) => s.setHubViewMode)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const setSelectedDocsProvider = useAppStore((s) => s.setSelectedDocsProvider)

  const [showNoDocs, setShowNoDocs] = useState(false)

  const apiKey = clientData?.api_key || ""

  // Merge nodes with capabilities
  const enrichedNodes: EnrichedNode[] = useMemo(() => {
    if (!data?.nodes) return []
    return data.nodes.map((node) => {
      const cap = capsData?.nodes?.find((c) => c.node_id === node.id)
      return {
        ...node,
        methods: cap?.methods || [],
        currencies: cap?.currencies || [],
        integrationType: cap?.integration_type || "UNKNOWN",
        region: cap?.region || getRegion(node.id),
        hasCapabilities: !!cap,
      }
    })
  }, [data, capsData])

  // Stats
  const stats = useMemo(() => {
    const total = enrichedNodes.length
    const operational = enrichedNodes.filter((n) => isOperational(n)).length
    const onboarding = enrichedNodes.filter((n) => n.lifecycle_status === "ONBOARDING").length
    const withCaps = enrichedNodes.filter((n) => n.hasCapabilities).length
    return { total, operational, onboarding, withCaps }
  }, [enrichedNodes])

  // Handle node click → dynamic doc routing
  const handleNodeClick = useCallback((node: EnrichedNode) => {
    setSelectedNodeId(node.id)
    const provider = getProviderFromNode(node.id)
    if (provider === "viva") {
      // Open side panel with "Ver Docs" button
    }
  }, [setSelectedNodeId])

  const handleGoToDocs = useCallback((node: EnrichedNode) => {
    const provider = getProviderFromNode(node.id)
    if (provider) {
      setSelectedDocsProvider(provider)
      setSelectedNodeId(null)
      setActiveView("docs")
    } else {
      setShowNoDocs(true)
      setSelectedNodeId(null)
    }
  }, [setSelectedDocsProvider, setSelectedNodeId, setActiveView])

  const selectedEnriched = enrichedNodes.find((n) => n.id === selectedNodeId) || null

  // Loading
  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-neutral-800" />
          <Skeleton className="h-4 w-64 bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="w-9 h-9 rounded-lg bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32 bg-neutral-800" />
                  <Skeleton className="h-3 w-24 bg-neutral-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-400/5 p-8 text-center animate-in fade-in">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-400 mb-4">{error || "No data available"}</p>
        <Button variant="outline" size="sm" onClick={refetch} className="border-neutral-700 text-neutral-400 hover:text-white">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header + Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Integration Hub</h2>
            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-800/50 border border-neutral-800 rounded px-2 py-0.5">
              {stats.total} nodes
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            Biblioteca de Contas — Seleccione um gateway para ver documentação e snippets
          </p>
        </div>

        {/* View Toggle + Refresh */}
        <div className="flex items-center gap-2">
          {/* Capabilities indicator */}
          {!capsLoading && (
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border",
              stats.withCaps > 0
                ? "text-green-400/70 bg-green-400/5 border-green-400/10"
                : "text-amber-400/70 bg-amber-400/5 border-amber-400/10"
            )}>
              <CircleDot className="w-2.5 h-2.5" />
              {stats.withCaps}/{stats.total} Capabilities
            </div>
          )}
          <div className="flex items-center border border-neutral-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setHubViewMode("card")}
              className={cn(
                "p-2 transition-all",
                hubViewMode === "card" ? "bg-neutral-800 text-white" : "text-neutral-600 hover:text-neutral-400"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setHubViewMode("list")}
              className={cn(
                "p-2 transition-all",
                hubViewMode === "list" ? "bg-neutral-800 text-white" : "text-neutral-600 hover:text-neutral-400"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={refetch}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-600 hover:text-neutral-400 hover:border-neutral-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { label: "Total Nodes", value: stats.total, color: "text-white" },
          { label: "Operacionais", value: stats.operational, color: "text-green-400" },
          { label: "Onboarding", value: stats.onboarding, color: "text-amber-400" },
          { label: "Com Capabilities", value: stats.withCaps, color: "text-cyan-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-neutral-900/40 border border-neutral-800 px-3 py-2.5">
            <p className={cn("text-base font-bold font-mono", s.color)}>{s.value}</p>
            <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Capabilities fallback banner */}
      {!capsLoading && stats.withCaps === 0 && stats.total > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-400/5 border border-amber-400/10 px-3.5 py-2.5 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400/70">
            Capabilities endpoint unavailable — a exibir metadados em modo fallback (hardcoded).
          </p>
        </div>
      )}

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {hubViewMode === "card" ? (
          <motion.div
            key="card-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
          >
            {enrichedNodes.map((node, i) => (
              <NodeCard
                key={node.id}
                node={node}
                enriched={node}
                index={i}
                onNavigate={() => handleNodeClick(node)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-neutral-800 overflow-hidden"
          >
            {/* List header */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/50">
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider w-8">Node</span>
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider flex-1 min-w-0">Identidade</span>
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider hidden sm:block w-20">Status</span>
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider hidden md:block w-10">Região</span>
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider hidden lg:block w-24">Tipo</span>
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider hidden lg:block">Métodos</span>
              <span className="w-8" />
            </div>
            {/* List rows */}
            {enrichedNodes.map((node, i) => (
              <NodeListRow
                key={node.id}
                node={node}
                enriched={node}
                index={i}
                onNavigate={() => handleNodeClick(node)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {selectedEnriched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:bg-black/20 sm:backdrop-blur-[2px]"
            onClick={() => setSelectedNodeId(null)}
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedEnriched && (
          <SidePanel
            key={selectedEnriched.id}
            node={selectedEnriched}
            enriched={selectedEnriched}
            apiKey={apiKey}
            onClose={() => setSelectedNodeId(null)}
            onGoToDocs={() => handleGoToDocs(selectedEnriched)}
          />
        )}
      </AnimatePresence>

      {/* No Docs Toast */}
      <AnimatePresence>
        {showNoDocs && (
          <NoDocsToast onClose={() => setShowNoDocs(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
