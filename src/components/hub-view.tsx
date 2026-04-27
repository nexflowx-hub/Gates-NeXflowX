"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAppStore, type ProviderId, type FamilyId } from "@/lib/store"
import { useClientData } from "@/components/security-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import {
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Server,
  X,
  Key,
  Terminal,
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
  Landmark,
  CircleDot,
  Clock,
  MapPin,
  Layers,
  ChevronRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
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

// ─── Family Definitions ─────────────────────────────────
interface FamilyDef {
  id: FamilyId
  label: string
  icon: LucideIcon
  color: string
  subtitle: string
  nodeMatch: string | null
  docsProvider: ProviderId | null
  hasVivaCountries: boolean
  children: string[]
  placeholder: boolean
  placeholderTag?: string
}

const FAMILIES: FamilyDef[] = [
  {
    id: "stripe",
    label: "Stripe",
    icon: CreditCard,
    color: "violet",
    subtitle: "Relay Universal — Ghost Mode",
    nodeMatch: "STRIPE",
    docsProvider: "stripe",
    hasVivaCountries: false,
    children: [],
    placeholder: false,
  },
  {
    id: "sibs",
    label: "SIBS",
    icon: Smartphone,
    color: "green",
    subtitle: "Native API — MB WAY & Multibanco",
    nodeMatch: "SIBS",
    docsProvider: "sibs",
    hasVivaCountries: false,
    children: [],
    placeholder: false,
  },
  {
    id: "eupago",
    label: "Eupago",
    icon: Landmark,
    color: "teal",
    subtitle: "Pagamentos Portugal",
    nodeMatch: null,
    docsProvider: null,
    hasVivaCountries: false,
    children: [],
    placeholder: true,
    placeholderTag: "Em Breve",
  },
  {
    id: "viva",
    label: "Viva",
    icon: Wallet,
    color: "emerald",
    subtitle: "Smart Checkout — Pass-Through",
    nodeMatch: "VIVA",
    docsProvider: "viva",
    hasVivaCountries: true,
    children: [],
    placeholder: false,
  },
  {
    id: "sepa",
    label: "SEPA",
    icon: ArrowRight,
    color: "rose",
    subtitle: "Transferências Instantâneas",
    nodeMatch: null,
    docsProvider: null,
    hasVivaCountries: false,
    children: [],
    placeholder: true,
    placeholderTag: "Em Breve",
  },
  {
    id: "mollie",
    label: "Mollie",
    icon: Globe,
    color: "amber",
    subtitle: "Relay com Webhook Enrichment",
    nodeMatch: "MOLLIE",
    docsProvider: "mollie",
    hasVivaCountries: false,
    children: [],
    placeholder: false,
  },
  {
    id: "brasil",
    label: "Brasil",
    icon: Zap,
    color: "lime",
    subtitle: "MisticPay · ElitePay",
    nodeMatch: null,
    docsProvider: null,
    hasVivaCountries: false,
    children: ["MisticPay", "ElitePay"],
    placeholder: true,
    placeholderTag: "Em Breve",
  },
  {
    id: "crypto",
    label: "Crypto",
    icon: Lock,
    color: "orange",
    subtitle: "Nowpayments · OnRamp · Kucoin",
    nodeMatch: null,
    docsProvider: null,
    hasVivaCountries: false,
    children: ["Nowpayments", "OnRamp", "Kucoin"],
    placeholder: true,
    placeholderTag: "Em Breve",
  },
]

// ─── Family color map ──────────────────────────────────
const FAMILY_COLORS: Record<string, {
  main: string
  bg: string
  border: string
  glow: string
  ring: string
  badge: string
  gradient: string
}> = {
  violet: {
    main: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.12)]",
    ring: "ring-violet-400/30",
    badge: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
  },
  green: {
    main: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.12)]",
    ring: "ring-green-400/30",
    badge: "bg-green-400/10 text-green-400 border-green-400/20",
    gradient: "from-green-500/20 via-green-500/5 to-transparent",
  },
  teal: {
    main: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.12)]",
    ring: "ring-teal-400/30",
    badge: "bg-teal-400/10 text-teal-400 border-teal-400/20",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
  },
  emerald: {
    main: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.12)]",
    ring: "ring-emerald-400/30",
    badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  rose: {
    main: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.12)]",
    ring: "ring-rose-400/30",
    badge: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
  },
  amber: {
    main: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.12)]",
    ring: "ring-amber-400/30",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  lime: {
    main: "text-lime-400",
    bg: "bg-lime-400/10",
    border: "border-lime-400/20",
    glow: "shadow-[0_0_30px_rgba(132,204,22,0.12)]",
    ring: "ring-lime-400/30",
    badge: "bg-lime-400/10 text-lime-400 border-lime-400/20",
    gradient: "from-lime-500/20 via-lime-500/5 to-transparent",
  },
  orange: {
    main: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.12)]",
    ring: "ring-orange-400/30",
    badge: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
  },
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
const familyCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
}

const panelOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const panelSlideVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring" as const, damping: 28, stiffness: 220 } },
  exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" as const } },
}

const bannerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.35 } },
}

// ─── Family Card Component ──────────────────────────────
interface FamilyData {
  family: FamilyDef
  nodes: EnrichedNode[]
  aggregatedMethods: string[]
  aggregatedCurrencies: string[]
  hasOperational: boolean
  hasOnboarding: boolean
  integrationType: "NATIVE" | "PASS_THROUGH" | "UNKNOWN"
}

function FamilyCard({
  familyData,
  index,
  onCardClick,
  onDocsClick,
  onVivaCountriesClick,
}: {
  familyData: FamilyData
  index: number
  onCardClick: () => void
  onDocsClick: (e: React.MouseEvent) => void
  onVivaCountriesClick: (e: React.MouseEvent) => void
}) {
  const { family, nodes, aggregatedMethods, aggregatedCurrencies, hasOperational, hasOnboarding, integrationType } = familyData
  const colors = FAMILY_COLORS[family.color] || FAMILY_COLORS.violet
  const IconComponent = family.icon
  const isPlaceholder = family.placeholder
  const nodeCount = nodes.length
  const operationalCount = nodes.filter((n) => isOperational(n)).length
  const onboardingCount = nodes.filter((n) => n.lifecycle_status === "ONBOARDING").length

  return (
    <motion.div
      custom={index}
      variants={familyCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={isPlaceholder ? undefined : { scale: 1.015, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl border overflow-hidden transition-all duration-300",
        isPlaceholder
          ? "border-neutral-800/60 bg-neutral-900/30"
          : cn(
              "border-neutral-800 hover:border-neutral-700",
              hasOperational && colors.glow,
            ),
        isPlaceholder ? "" : "cursor-pointer group",
      )}
      onClick={isPlaceholder ? undefined : onCardClick}
    >
      {/* Top gradient accent for active families */}
      {!isPlaceholder && hasOperational && (
        <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r", colors.gradient)} />
      )}

      <div className="p-4 sm:p-5">
        {/* ── Top Row: Icon + Name + Status ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
              isPlaceholder
                ? "bg-neutral-800/50 border-neutral-800"
                : cn(colors.bg, colors.border),
            )}>
              <IconComponent className={cn("w-[18px] h-[18px]", isPlaceholder ? "text-neutral-600" : colors.main)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-sm font-bold truncate",
                  isPlaceholder ? "text-neutral-500" : "text-white",
                )}>
                  {family.label}
                </h3>
              </div>
              <p className={cn(
                "text-[11px] mt-0.5 truncate",
                isPlaceholder ? "text-neutral-700" : "text-neutral-500",
              )}>
                {family.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isPlaceholder && family.placeholderTag && (
              <span className="text-[9px] font-bold text-neutral-500 bg-neutral-800/80 border border-neutral-800 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                {family.placeholderTag}
              </span>
            )}
            {!isPlaceholder && hasOperational && operationalCount > 0 && (
              <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(34,197,94,0.15)]">
                ATIVO
              </span>
            )}
            {!isPlaceholder && hasOnboarding && onboardingCount > 0 && (
              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 animate-pulse">
                ONBOARDING
              </span>
            )}
            {!isPlaceholder && !hasOperational && !hasOnboarding && nodeCount > 0 && (
              <span className="text-[9px] font-bold text-neutral-500 bg-neutral-800 border border-neutral-700 rounded-full px-2 py-0.5">
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* ── Nodes Count + Integration Type ── */}
        {!isPlaceholder && nodeCount > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
              <Server className="w-3 h-3" />
              <span className="font-mono font-semibold">{nodeCount}</span>
              <span>node{nodeCount !== 1 ? "s" : ""}</span>
              {operationalCount > 0 && (
                <span className="text-green-400/60">({operationalCount} op)</span>
              )}
            </div>
            {integrationType !== "UNKNOWN" && (
              <span className={cn(
                "text-[9px] font-bold border rounded px-1.5 py-0.5",
                integrationType === "NATIVE"
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : "text-violet-400 bg-violet-400/10 border-violet-400/20",
              )}>
                {integrationType === "NATIVE" ? "NATIVE" : "PASS_THROUGH"}
              </span>
            )}
          </div>
        )}

        {/* ── Placeholder: children list ── */}
        {isPlaceholder && family.children.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {family.children.map((child) => (
              <span
                key={child}
                className="inline-flex items-center text-[10px] font-medium text-neutral-600 bg-neutral-800/40 border border-neutral-800 rounded-md px-2 py-0.5"
              >
                {child}
              </span>
            ))}
          </div>
        )}

        {/* ── Methods ── */}
        {!isPlaceholder && aggregatedMethods.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {aggregatedMethods.slice(0, 6).map((method) => {
              const MIcon = getMethodIcon(method)
              return (
                <span
                  key={method}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-800/60 border border-neutral-800 rounded-md px-1.5 py-0.5"
                >
                  <MIcon className="w-2.5 h-2.5 text-neutral-500" />
                  {method.toUpperCase()}
                </span>
              )
            })}
            {aggregatedMethods.length > 6 && (
              <span className="text-[10px] text-neutral-600">+{aggregatedMethods.length - 6}</span>
            )}
          </div>
        )}

        {/* ── Currencies ── */}
        {!isPlaceholder && aggregatedCurrencies.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {aggregatedCurrencies.map((c) => (
              <span key={c} className="text-[9px] font-mono font-medium text-neutral-500 bg-neutral-900/80 border border-neutral-800 rounded px-1.5 py-0.5">
                {c.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* ── Bottom Row ── */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-neutral-800/60">
          {isPlaceholder ? (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
              <Clock className="w-3 h-3" />
              <span>Integração pendente</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {/* Docs shortcut */}
                {family.docsProvider && (
                  <button
                    onClick={onDocsClick}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all hover:scale-[1.03]",
                      colors.badge,
                    )}
                  >
                    <BookOpen className="w-3 h-3" />
                    Docs
                  </button>
                )}
                {/* Viva Countries */}
                {family.hasVivaCountries && (
                  <button
                    onClick={onVivaCountriesClick}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 transition-all hover:scale-[1.03] hover:bg-emerald-400/15"
                  >
                    <MapPin className="w-3 h-3" />
                    Ver Países
                  </button>
                )}
                {!family.docsProvider && !family.hasVivaCountries && (
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500">Clique para detalhes</span>
                  </div>
                )}
              </div>
              <ChevronRight className={cn(
                "w-3.5 h-3.5 transition-all",
                "text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-0.5",
              )} />
            </>
          )}
        </div>
      </div>
    </motion.div>
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
  const hasDocs = provider === "viva" || provider === "sibs" || provider === "stripe" || provider === "mollie"

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col">
      <motion.div
        variants={panelSlideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
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
              Events delivered to webhook_callback_url configured in Security &amp; Webhooks.
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

  // Group nodes by family
  const familyDataMap = useMemo((): Map<FamilyId, FamilyData> => {
    const map = new Map<FamilyId, FamilyData>()
    for (const family of FAMILIES) {
      const familyNodes = family.nodeMatch
        ? enrichedNodes.filter((n) => n.id.toUpperCase().includes(family.nodeMatch!))
        : []

      const allMethods = [...new Set(familyNodes.flatMap((n) => n.methods))]
      const allCurrencies = [...new Set(familyNodes.flatMap((n) => n.currencies))]
      const hasOperational = familyNodes.some((n) => isOperational(n))
      const hasOnboarding = familyNodes.some((n) => n.lifecycle_status === "ONBOARDING")

      const integrationTypes = new Set(
        familyNodes.map((n) => n.integrationType).filter((t) => t !== "UNKNOWN"),
      )
      let integrationType: "NATIVE" | "PASS_THROUGH" | "UNKNOWN" = "UNKNOWN"
      if (integrationTypes.has("NATIVE")) integrationType = "NATIVE"
      else if (integrationTypes.has("PASS_THROUGH")) integrationType = "PASS_THROUGH"

      map.set(family.id, {
        family,
        nodes: familyNodes,
        aggregatedMethods: allMethods,
        aggregatedCurrencies: allCurrencies,
        hasOperational,
        hasOnboarding,
        integrationType,
      })
    }
    return map
  }, [enrichedNodes])

  // Stats
  const stats = useMemo(() => {
    const totalFamilies = FAMILIES.length
    let activeProviders = 0
    let onboardingProviders = 0
    let totalNodes = 0

    for (const [, fd] of familyDataMap) {
      if (fd.hasOperational) activeProviders++
      if (fd.hasOnboarding) onboardingProviders++
      totalNodes += fd.nodes.length
    }

    return { totalFamilies, activeProviders, onboardingProviders, totalNodes }
  }, [familyDataMap])

  // Handle family card click → open side panel with first node
  const handleFamilyCardClick = useCallback((familyId: FamilyId) => {
    const fd = familyDataMap.get(familyId)
    if (fd && fd.nodes.length > 0) {
      setSelectedNodeId(fd.nodes[0].id)
    }
  }, [familyDataMap, setSelectedNodeId])

  // Handle docs shortcut on family card
  const handleFamilyDocsClick = useCallback((familyId: FamilyId) => {
    const fd = familyDataMap.get(familyId)
    if (fd?.family.docsProvider) {
      setSelectedDocsProvider(fd.family.docsProvider)
      setSelectedNodeId(null)
      setActiveView("docs")
    } else {
      setShowNoDocs(true)
    }
  }, [familyDataMap, setSelectedDocsProvider, setSelectedNodeId, setActiveView])

  // Handle Viva Countries button
  const handleVivaCountriesClick = useCallback(() => {
    setActiveView("viva-countries")
  }, [setActiveView])

  // Handle Go to Docs from Side Panel
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-neutral-800" />
          <Skeleton className="h-4 w-72 bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg bg-neutral-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 bg-neutral-800" />
                  <Skeleton className="h-3 w-36 bg-neutral-800" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-5 w-16 bg-neutral-800" />
                <Skeleton className="h-5 w-24 bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ──
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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Integration Hub</h2>
            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-800/50 border border-neutral-800 rounded px-2 py-0.5">
              {FAMILIES.length} families
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            Biblioteca de Families — Seleccione uma família para ver gateways e documentação
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!capsLoading && (
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border",
              stats.totalNodes > 0
                ? "text-green-400/70 bg-green-400/5 border-green-400/10"
                : "text-neutral-600 bg-neutral-800/50 border-neutral-800"
            )}>
              <CircleDot className="w-2.5 h-2.5" />
              {stats.totalNodes} nodes
            </div>
          )}
          <button
            onClick={refetch}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-600 hover:text-neutral-400 hover:border-neutral-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { label: "Total Families", value: stats.totalFamilies, color: "text-white", icon: Layers },
          { label: "Active Providers", value: stats.activeProviders, color: "text-green-400", icon: CircleDot },
          { label: "Onboarding", value: stats.onboardingProviders, color: "text-amber-400", icon: Loader2 },
          { label: "Total Nodes", value: stats.totalNodes, color: "text-cyan-400", icon: Server },
        ].map((s) => {
          const SIcon = s.icon
          return (
            <div key={s.label} className="rounded-lg bg-neutral-900/40 border border-neutral-800 px-3 py-2.5 flex items-center gap-2.5">
              <SIcon className={cn("w-4 h-4 shrink-0", s.color, "opacity-50")} />
              <div>
                <p className={cn("text-base font-bold font-mono leading-none", s.color)}>{s.value}</p>
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Geo-Aware Info Banner ── */}
      <motion.div
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
        className="rounded-lg bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent border border-cyan-400/10 px-4 py-3 mb-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-cyan-300/90 uppercase tracking-wider">Geo-Aware Architecture</h4>
            <p className="text-[12px] text-cyan-400/60 leading-relaxed mt-0.5">
              A arquitetura NeXFlowX suporta capacidades Geo-Aware — os métodos de pagamento são filtrados automaticamente pelo contexto do pagador (IP / Country Code) para maximizar a conversão.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Capabilities fallback banner ── */}
      {!capsLoading && stats.totalNodes > 0 && enrichedNodes.every((n) => !n.hasCapabilities) && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-400/5 border border-amber-400/10 px-3.5 py-2.5 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400/70">
            Capabilities endpoint unavailable — a exibir metadados em modo fallback.
          </p>
        </div>
      )}

      {/* ── Family Cards Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key="family-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          {FAMILIES.map((family, i) => {
            const fd = familyDataMap.get(family.id)!
            return (
              <FamilyCard
                key={family.id}
                familyData={fd}
                index={i}
                onCardClick={() => handleFamilyCardClick(family.id)}
                onDocsClick={(e) => {
                  e.stopPropagation()
                  handleFamilyDocsClick(family.id)
                }}
                onVivaCountriesClick={(e) => {
                  e.stopPropagation()
                  handleVivaCountriesClick()
                }}
              />
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Side Panel Overlay ── */}
      <AnimatePresence>
        {selectedEnriched && (
          <motion.div
            variants={panelOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:bg-black/20 sm:backdrop-blur-[2px]"
            onClick={() => setSelectedNodeId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Side Panel ── */}
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

      {/* ── No Docs Toast ── */}
      <AnimatePresence>
        {showNoDocs && (
          <NoDocsToast onClose={() => setShowNoDocs(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
