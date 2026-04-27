"use client"

import { useState, useMemo, createElement } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Search,
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  Globe,
  Zap,
  Lock,
  Info,
  Shield,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Country Data ────────────────────────────────────────

interface Vivacountry {
  code: string
  name: string
  flag: string
  methods: string[]
}

const RAW_COUNTRIES: { code: string; name: string; flag: string; methods: string[] | string }[] = [
  { code: "CY", name: "Chipre", flag: "🇨🇾", methods: ["Cartão", "PayPal", "Viva Wallet", "Pagamento por Banco", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "GR", name: "Grécia", flag: "🇬🇷", methods: ["Cartão", "Viva Wallet", "IRIS", "TBI Bank", "Klarna", "Paypal", "DIAS", "Cash (Viva Spot)", "Bluecode", "Pagamento na Entrega", "BitPay", "WeChat Pay"] },
  { code: "BG", name: "Bulgária", flag: "🇧🇬", methods: ["Cartão", "PayPal", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "RO", name: "Romênia", flag: "🇷🇴", methods: ["Cartão", "PayPal", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", methods: ["Cartão", "PayPal", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "IE", name: "Irlanda", flag: "🇮🇪", methods: ["Cartão", "PayPal", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", methods: ["Cartão", "MB Way", "Multibanco", "Paypal", "Klarna", "Pagamento por Banco", "WeChat Pay", "BitPay", "Bluecode", "Pagamento na Entrega", "Trustly"] },
  { code: "ES", name: "Espanha", flag: "🇪🇸", methods: ["Cartão", "Paypal", "Klarna", "Pagamento por Banco", "Trustly", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "IT", name: "Itália", flag: "🇮🇹", methods: ["Cartão", "PayPal", "Satispay", "Klarna", "Bancomat Pay", "WeChat Pay", "Bluecode", "BitPay", "Pagamento na Entrega"] },
  { code: "MT", name: "Malta", flag: "🇲🇹", methods: ["Cartão", "Paypal", "Viva Wallet", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "AT", name: "Áustria", flag: "🇦🇹", methods: ["Cartão", "Klarna", "Paypal", "EPS", "Trustly", "Pagamento por Banco", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "HR", name: "Croácia", flag: "🇭🇷", methods: ["Cartão", "Paypal", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "HU", name: "Hungria", flag: "🇭🇺", methods: ["Cartão", "PayPal", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "CZ", name: "República Tcheca", flag: "🇨🇿", methods: ["Cartão", "Paypal", "Klarna", "PayU", "Trustly", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "DE", name: "Alemanha", flag: "🇩🇪", methods: ["Cartão", "PayPal", "Klarna", "Pagamento por Banco", "BlueCode", "Trustly", "Pagamento na Entrega", "WeChat Pay", "BitPay", "Satispay"] },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰", methods: "Cartão de crédito, pagamento móvel, Klarna, Trustly, PayPal, pagamento na entrega, WeChat Pay, BitPay" },
  { code: "FI", name: "Finlândia", flag: "🇫🇮", methods: "Cartão de crédito, pagamento móvel, Klarna, Trustly, PayPal, pagamento na entrega, WeChat Pay, BitPay" },
  { code: "NO", name: "Noruega", flag: "🇳🇴", methods: "Trustly, Pague com Cartão Bancário, Pagamento Móvel, PayPal, Bluecode, Pague na Entrega, WeChat Pay, BitPay, Klarna" },
  { code: "SE", name: "Suécia", flag: "🇸🇪", methods: "Swish, Trustly, Pague com Cartão Bancário, PayPal, Klarna, Pague na Entrega, WeChat Pay, BitPay" },
  { code: "FR", name: "França", flag: "🇫🇷", methods: ["Cartão", "Paypal", "Klarna", "Pagamento por Banco", "Satispay", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "BE", name: "Bélgica", flag: "🇧🇪", methods: ["Cartão", "Paypal", "Klarna", "Pagamento por Banco", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay", "Bancontact QR"] },
  { code: "NL", name: "Holanda", flag: "🇳🇱", methods: ["Card", "Paypal", "Klarna", "Pagamento por Banco", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay"] },
  { code: "LU", name: "Luxemburgo", flag: "🇱🇺", methods: "Cartão iDEAL, PayPal, Klarna, Pagamento por Banco, Trustly, Bluecode, Pagamento na Entrega, WeChat Pay, BitPay" },
  { code: "PL", name: "Polônia", flag: "🇵🇱", methods: ["Cartão", "Paypal", "Satispay", "Pagamento por Banco", "Bluecode", "Pagamento na Entrega", "WeChat Pay", "BitPay", "BLIK", "P24", "PayU"] },
]

const VIVA_COUNTRIES: Vivacountry[] = RAW_COUNTRIES.map((c) => ({
  ...c,
  methods: typeof c.methods === "string"
    ? c.methods.split(",").map((m) => m.trim()).filter(Boolean)
    : c.methods,
}))

// ─── Local Hero Highlighting ─────────────────────────────

type HighlightColor = "green" | "yellow" | "orange" | "red" | "blue" | "teal" | "neutral"

interface HighlightRule {
  countryCodes: string[]
  matchPatterns: string[]
  color: HighlightColor
}

const HIGHLIGHT_RULES: HighlightRule[] = [
  { countryCodes: ["PT"], matchPatterns: ["MB WAY", "MB Way", "Multibanco"], color: "green" },
  { countryCodes: ["GR"], matchPatterns: ["IRIS", "DIAS"], color: "green" },
  { countryCodes: ["SE"], matchPatterns: ["Swish"], color: "yellow" },
  { countryCodes: ["NL", "LU"], matchPatterns: ["iDEAL"], color: "orange" },
  { countryCodes: ["PL"], matchPatterns: ["BLIK"], color: "red" },
  { countryCodes: ["BE"], matchPatterns: ["Bancontact"], color: "blue" },
  { countryCodes: ["IT"], matchPatterns: ["Satispay", "Bancomat Pay"], color: "teal" },
  { countryCodes: ["AT"], matchPatterns: ["EPS"], color: "teal" },
  { countryCodes: ["DK", "FI", "NO"], matchPatterns: ["pagamento móvel", "Pagamento Móvel", "Mobile Payment", "pague com cartão bancário", "cartão de crédito"], color: "teal" },
]

const HIGHLIGHT_STYLES: Record<HighlightColor, { bg: string; border: string; text: string; dot: string }> = {
  green: { bg: "bg-green-400/15", border: "border-green-400/30", text: "text-green-300", dot: "bg-green-400" },
  yellow: { bg: "bg-yellow-400/15", border: "border-yellow-400/30", text: "text-yellow-300", dot: "bg-yellow-400" },
  orange: { bg: "bg-orange-400/15", border: "border-orange-400/30", text: "text-orange-300", dot: "bg-orange-400" },
  red: { bg: "bg-red-400/15", border: "border-red-400/30", text: "text-red-300", dot: "bg-red-400" },
  blue: { bg: "bg-blue-400/15", border: "border-blue-400/30", text: "text-blue-300", dot: "bg-blue-400" },
  teal: { bg: "bg-teal-400/15", border: "border-teal-400/30", text: "text-teal-300", dot: "bg-teal-400" },
  neutral: { bg: "bg-neutral-800/60", border: "border-neutral-700/50", text: "text-neutral-400", dot: "bg-neutral-600" },
}

function getMethodHighlight(countryCode: string, methodName: string): HighlightColor {
  const methodUpper = methodName.toUpperCase()
  for (const rule of HIGHLIGHT_RULES) {
    if (!rule.countryCodes.includes(countryCode)) continue
    for (const pattern of rule.matchPatterns) {
      if (methodUpper.includes(pattern.toUpperCase())) return rule.color
    }
  }
  return "neutral"
}

function isLocalHero(countryCode: string, methodName: string): boolean {
  return getMethodHighlight(countryCode, methodName) !== "neutral"
}

// ─── Method Icons ────────────────────────────────────────

function getMethodIcon(method: string) {
  const m = method.toUpperCase()
  if (m.includes("CARTÃO") || m.includes("CART") || m.includes("CARD") || m.includes("CRÉDITO") || m.includes("CRÉDITO") || m.includes("CREDIT")) return CreditCard
  if (m.includes("MB WAY") || m.includes("MBWAY") || m.includes("SWISH") || m.includes("BLIK") || m.includes("PAGAMENTO MÓVEL") || m.includes("MOBILE")) return Smartphone
  if (m.includes("WALLET") || m.includes("VIVA WALLET")) return Wallet
  if (m.includes("PAYPAL")) return Globe
  if (m.includes("BITPAY") || m.includes("CRYPTO") || m.includes("BITCOIN")) return Zap
  if (m.includes("BANCO") || m.includes("BANK") || m.includes("TRUSTLY") || m.includes("IDEAL") || m.includes("EPS") || m.includes("MULTIBANCO") || m.includes("BANCONTACT")) return Shield
  if (m.includes("KLARNA")) return CreditCard
  if (m.includes("SATISPAY") || m.includes("BANCOMAT") || m.includes("IRIS") || m.includes("DIAS")) return Smartphone
  if (m.includes("WECHAT")) return Globe
  if (m.includes("BLUECODE")) return Lock
  if (m.includes("ENTREGA") || m.includes("SPOT") || m.includes("CASH")) return MapPin
  return CreditCard
}

// ─── Framer Motion Variants ──────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
}

const headerVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

// ─── Badge Component ─────────────────────────────────────

function MethodPill({ method, countryCode }: { method: string; countryCode: string }) {
  const color = getMethodHighlight(countryCode, method)
  const style = HIGHLIGHT_STYLES[color]
  const hero = isLocalHero(countryCode, method)
  const methodIconComp = getMethodIcon(method)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium rounded-md px-1.5 py-0.5 border whitespace-nowrap transition-colors",
        style.bg,
        style.border,
        style.text,
        hero && "shadow-sm",
      )}
    >
      <span className="shrink-0 opacity-70 [&>svg]:w-2.5 [&>svg]:h-2.5">{createElement(methodIconComp)}</span>
      {method}
      {hero && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
      )}
    </span>
  )
}

// ─── Country Card ────────────────────────────────────────

function CountryCard({ country, index }: { country: Vivacountry; index: number }) {
  const methodCount = country.methods.length
  const heroCount = country.methods.filter((m) => isLocalHero(country.code, m)).length

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      layout
      className={cn(
        "relative rounded-xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm",
        "hover:border-neutral-700 hover:bg-neutral-900/60",
        "transition-colors duration-300 overflow-hidden group",
      )}
    >
      {/* Top accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)",
        }}
      />

      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl leading-none">{country.flag}</span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{country.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">{country.code}</span>
                {heroCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-1.5 py-0.5">
                    <Zap className="w-2 h-2" />
                    {heroCount} local{heroCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-800/80 border border-neutral-700/50 rounded-lg px-2 py-1 whitespace-nowrap">
            {methodCount} método{methodCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Method pills */}
        <div className="flex flex-wrap gap-1 mt-3.5">
          <AnimatePresence mode="popLayout">
            {country.methods.map((method) => (
              <motion.span
                key={`${country.code}-${method}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <MethodPill method={method} countryCode={country.code} />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Stats Row ───────────────────────────────────────────

function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-neutral-400 bg-neutral-800/50 border border-neutral-800 rounded-lg px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-emerald-400/70" />
      <span className="font-semibold text-white">{value}</span>
      <span className="text-neutral-600 hidden sm:inline">{label}</span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────

export function VivaCountriesView() {
  const setActiveView = useAppStore((s) => s.setActiveView)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return VIVA_COUNTRIES
    const query = searchQuery.toLowerCase().trim()
    return VIVA_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.flag.includes(query),
    )
  }, [searchQuery])

  const totalMethods = useMemo(() => {
    return VIVA_COUNTRIES.reduce((sum, c) => sum + c.methods.length, 0)
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Header ── */}
      <motion.div variants={headerVariants} initial="hidden" animate="visible" className="space-y-4">
        {/* Back button */}
        <motion.button
          onClick={() => setActiveView("hub")}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-white bg-neutral-800/40 border border-neutral-800 rounded-lg px-3 py-2 hover:border-neutral-700 hover:bg-neutral-800/70 transition-all duration-200"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Hub
        </motion.button>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              VIVA Wallet — Cobertura Europeia
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1 shadow-[0_0_12px_rgba(52,211,153,0.1)]">
              <Wallet className="w-3 h-3" />
              VIVA
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-800/60 border border-neutral-700/50 rounded-full px-2.5 py-1">
              <Shield className="w-3 h-3" />
              Smart Checkout v2.2
            </span>
          </div>
          <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Smart Checkout disponível em {VIVA_COUNTRIES.length} mercados — Métodos de pagamento locais por país
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          <StatChip icon={MapPin} label="países" value={String(VIVA_COUNTRIES.length)} />
          <StatChip icon={CreditCard} label="métodos de pagamento" value={`${totalMethods}+`} />
          <StatChip icon={Filter} label="" value="Geo-Aware Filtering" />
        </div>
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar por país..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-10 pr-4 text-sm bg-neutral-900/60 border border-neutral-800 rounded-xl",
              "text-white placeholder:text-neutral-600",
              "focus:outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20",
              "transition-all duration-200",
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              <span className="text-xs text-neutral-600 hover:text-neutral-400">&times;</span>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-neutral-600 mt-2 pl-1">
            {filteredCountries.length} país{filteredCountries.length !== 1 ? "es" : ""} encontrado{filteredCountries.length !== 1 ? "s" : ""}
          </p>
        )}
      </motion.div>

      {/* ── Country Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={searchQuery}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
        >
          {filteredCountries.map((country, index) => (
            <CountryCard key={country.code} country={country} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Empty State ── */}
      {filteredCountries.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Globe className="w-10 h-10 text-neutral-800 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Nenhum país encontrado para &quot;{searchQuery}&quot;</p>
        </motion.div>
      )}

      {/* ── Geo-Aware Info Banner ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03] overflow-hidden"
      >
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-emerald-300">Geo-Aware Filtering</h3>
              <span className="text-[9px] font-bold text-emerald-400/60 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                NEUTRAL
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A arquitetura NeXFlowX implementa filtragem Geo-Aware no checkout — quando o país do pagador é
              identificado (via IP ou parâmetro <code className="text-[11px] font-mono text-emerald-400/80 bg-emerald-400/10 rounded px-1 py-0.5">country_code</code>),
              apenas os métodos disponíveis nesse mercado são apresentados, aumentando significativamente a taxa de conversão.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
