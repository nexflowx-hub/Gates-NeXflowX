"use client"

import { useState, useMemo } from "react"
import { useAppStore, type ProviderId } from "@/lib/store"
import {
  Copy,
  Check,
  ChevronRight,
  CreditCard,
  Wallet,
  Smartphone,
  Shield,
  ArrowRight,
  ExternalLink,
  Code2,
  Webhook,
  Info,
  Zap,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────
type ProviderId = "viva" | "sibs" | "stripe" | "mollie" | "sepa" | "pix" | "crypto"

interface Provider {
  id: ProviderId
  name: string
  subtitle: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  icon: typeof CreditCard
  hasDocs: boolean
  tag?: string
}

// ─── Provider Definitions ───────────────────────────────
const PROVIDERS: Provider[] = [
  {
    id: "viva",
    name: "VIVA Wallet",
    subtitle: "Smart Checkout — Pass-Through",
    color: "emerald",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    textColor: "text-emerald-400",
    icon: CreditCard,
    hasDocs: true,
    tag: "Smart Checkout",
  },
  {
    id: "sibs",
    name: "SIBS",
    subtitle: "Native API — MB WAY & Multibanco",
    color: "green",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    textColor: "text-green-400",
    icon: Smartphone,
    hasDocs: false,
    tag: "Em Breve",
  },
  {
    id: "stripe",
    name: "Stripe",
    subtitle: "Ghost Mode — Relay Universal",
    color: "violet",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
    textColor: "text-violet-400",
    icon: Globe,
    hasDocs: false,
    tag: "Em Breve",
  },
  {
    id: "mollie",
    name: "Mollie",
    subtitle: "Relay com Webhook Enrichment",
    color: "amber",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    textColor: "text-amber-400",
    icon: Wallet,
    hasDocs: false,
    tag: "Em Breve",
  },
  {
    id: "sepa",
    name: "SEPA Instant",
    subtitle: "Transferências Instantâneas",
    color: "blue",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    textColor: "text-blue-400",
    icon: Zap,
    hasDocs: false,
    tag: "Em Breve",
  },
  {
    id: "pix",
    name: "PIX",
    subtitle: "Pagamentos Instantâneos (BRL)",
    color: "cyan",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
    textColor: "text-cyan-400",
    icon: ArrowRight,
    hasDocs: false,
    tag: "Em Breve",
  },
  {
    id: "crypto",
    name: "Crypto",
    subtitle: "Pagamentos On-Chain",
    color: "orange",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    textColor: "text-orange-400",
    icon: Lock,
    hasDocs: false,
    tag: "Em Breve",
  },
]

// ─── Copy Button ────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label: string }) {
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
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all shrink-0",
        copied
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-neutral-700 bg-neutral-800/50 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600"
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

// ─── Code Block ─────────────────────────────────────────
function CodeBlock({
  code,
  language = "json",
  filename,
}: {
  code: string
  language?: string
  filename?: string
}) {
  return (
    <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-800">
          <span className="text-[11px] font-mono text-neutral-500">{filename}</span>
          <CopyButton text={code} label="Copy" />
        </div>
      )}
      {!filename && (
        <div className="flex justify-end px-3.5 py-1.5 border-b border-neutral-800/50">
          <CopyButton text={code} label="Copy" />
        </div>
      )}
      <pre className="p-3.5 text-[12px] font-mono text-neutral-300 leading-relaxed overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ─── Section Wrapper ────────────────────────────────────
function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden", className)}>
      {children}
    </section>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  step,
}: {
  icon: typeof Code2
  title: string
  step?: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/50">
      {step && (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-md px-1.5 py-0.5">
          {step}
        </span>
      )}
      <Icon className="w-4 h-4 text-neutral-500" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  )
}

// ─── Parameter Table ────────────────────────────────────
function ParamTable({
  params,
}: {
  params: { name: string; type: string; description: string }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Parâmetro</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={p.name} className={cn(i < params.length - 1 && "border-b border-neutral-800/50")}>
              <td className="px-4 py-2.5 text-xs font-mono text-emerald-400">{p.name}</td>
              <td className="px-4 py-2.5 text-xs text-neutral-500 font-mono">{p.type}</td>
              <td className="px-4 py-2.5 text-xs text-neutral-400">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Status Badge ───────────────────────────────────────
function StatusBadge({ status, color, description }: { status: string; color: string; description: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-400/10 border-green-400/20 text-green-400",
    red: "bg-red-400/10 border-red-400/20 text-red-400",
    amber: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    blue: "bg-blue-400/10 border-blue-400/20 text-blue-400",
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={cn("text-[11px] font-bold border rounded-full px-2.5 py-0.5 min-w-[72px] text-center", colorMap[color])}>
        {status}
      </span>
      <span className="text-xs text-neutral-400">{description}</span>
    </div>
  )
}

// ─── VIVA Smart Checkout Documentation ──────────────────
function VivaDocs() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Hero */}
      <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-white">VIVA Smart Checkout</h2>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                Smart Checkout
              </span>
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-2 py-0.5">
                Pass-Through
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Bem-vindo ao portal do NeXFlowX Maestro. Esta documentação descreve o fluxo de integração
              para a <span className="text-emerald-400 font-medium">VIVA Wallet</span> utilizando o modelo{" "}
              <span className="text-white font-medium">Smart Checkout (Pass-Through)</span>.
            </p>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Este modelo delega o processamento de cartões e a conformidade PCI-DSS para o gateway de pagamento,
              suportando nativamente{" "}
              <span className="text-white">Cartões de Crédito/Débito</span>,{" "}
              <span className="text-white">Apple Pay</span>,{" "}
              <span className="text-white">Google Pay</span> e{" "}
              <span className="text-white">MB WAY</span>, sem necessidade de desenhar formulários complexos no frontend.
            </p>
          </div>
        </div>

        {/* Flow Steps Overview */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Code2, label: "1. Criar Ordem", desc: "Backend — Gerar orderCode" },
            { icon: Globe, label: "2. Apresentar Checkout", desc: "Frontend — Redirect ou Iframe" },
            { icon: Webhook, label: "3. Receber Webhook", desc: "Servidor — Atualizar encomenda" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-lg bg-neutral-900/50 border border-neutral-800 px-3.5 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                <s.icon className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{s.label}</p>
                <p className="text-[11px] text-neutral-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 — Create Payment Order */}
      <Section>
        <SectionHeader icon={Code2} title="Criar uma Ordem de Pagamento" step="Step 1" />
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-400">
            Para iniciar um pagamento, o seu servidor deve efetuar um pedido autenticado à API NeXFlowX
            para gerar um <span className="text-white font-medium">orderCode</span> único.
          </p>

          {/* Endpoint Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-md px-2 py-0.5">
              POST
            </span>
            <code className="text-xs font-mono text-neutral-300 bg-neutral-800/50 border border-neutral-700 rounded-md px-2.5 py-1 break-all">
              https://proxy.nexflowx.tech/relay/VIVA_PT_001/checkout/v2/orders
            </code>
          </div>

          {/* Headers */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Headers Obrigatórios</p>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 space-y-1.5">
              <div className="flex items-center gap-3">
                <code className="text-xs font-mono text-amber-400 w-36 shrink-0">Content-Type</code>
                <code className="text-xs font-mono text-neutral-400">application/json</code>
              </div>
              <div className="flex items-center gap-3">
                <code className="text-xs font-mono text-amber-400 w-36 shrink-0">x-proxy-key</code>
                <code className="text-xs font-mono text-neutral-400">&lt;A_SUA_CHAVE_DE_API_NEXFLOWX&gt;</code>
              </div>
            </div>
          </div>

          {/* Request Body */}
          <CodeBlock
            filename="Request Body (JSON)"
            code={JSON.stringify({
              amount: 2500,
              reference: "ORD-2026-001",
              customerTrns: "Pagamento Fatura #ORD-2026-001",
              sourceCode: "8851",
            }, null, 2)}
          />

          {/* Params Table */}
          <ParamTable
            params={[
              { name: "amount", type: "integer", description: "Valor da transação em cêntimos (ex: 2500 representa 25.00€)." },
              { name: "reference", type: "string", description: "O ID único da encomenda no seu sistema. Esta referência será devolvida nos webhooks." },
              { name: "customerTrns", type: "string", description: "Descrição amigável que aparecerá no ecrã de pagamento e no extrato do cliente." },
              { name: "sourceCode", type: "string", description: 'O código de 4 dígitos da sua "Fonte de Pagamento", configurado no painel da Viva.' },
            ]}
          />

          {/* Response */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Resposta de Sucesso (HTTP 200)
              </p>
            </div>
            <CodeBlock
              filename="Response (200 OK)"
              code={JSON.stringify({
                orderCode: 4160204319947614,
              }, null, 2)}
            />
          </div>
        </div>
      </Section>

      {/* Step 2 — Frontend Integration */}
      <Section>
        <SectionHeader icon={Globe} title="Integração no Frontend" step="Step 2" />
        <div className="p-5 space-y-5">
          <p className="text-sm text-neutral-400">
            Com o <span className="text-white font-medium">orderCode</span> gerado, a sua aplicação frontend
            deve encaminhar o cliente para o ambiente seguro da Viva. Pode fazê-lo através de dois métodos
            suportados: <span className="text-white">Redirecionamento</span> ou <span className="text-white">Iframe</span>.
          </p>

          {/* Method A */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
                Recomendado
              </span>
              <h4 className="text-sm font-semibold text-white">Método A: Redirecionamento Direto</h4>
            </div>
            <p className="text-xs text-neutral-500">
              Esta é a abordagem mais robusta, garantindo 100% de compatibilidade com Apple Pay e fluxos bancários
              de autenticação forte (3D Secure).
            </p>
            <CodeBlock
              filename="JavaScript"
              language="javascript"
              code={`// Exemplo JavaScript - Redirecionar o cliente\nconst orderCode = 4160204319947614; // Recebido do backend\nconst vivaCheckoutUrl = \`https://www.vivapayments.com/web/checkout?ref=\${orderCode}\`;\n\nwindow.location.href = vivaCheckoutUrl;`}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

          {/* Method B */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Método B: Integração via Iframe (Modal)</h4>
            <p className="text-xs text-neutral-500">
              Se pretender manter o cliente na sua página sem um redirecionamento total, pode incorporar
              o Smart Checkout num Iframe.
            </p>
            <CodeBlock
              filename="HTML + JavaScript"
              language="html"
              code={`<div id="viva-checkout-container" style="width: 100%; height: 600px; border: none;">
n  <iframe
n    id="viva-iframe"
n    width="100%"
n    height="100%"
n    frameborder="0"
n    allowtransparency="true"
n    style="border: 0;"
n  ></iframe>
n</div>
n
n<script>
n  function openSmartCheckout(orderCode) {
n    const iframe = document.getElementById('viva-iframe');
n    // Adicionar parâmetro &color=... para personalizar a cor primária se desejar
n    iframe.src = \`https://www.vivapayments.com/web/checkout?ref=\${orderCode}\`;
n  }
n
n  // Chamar a função após receber o orderCode da sua API
n  openSmartCheckout('4160204319947614');
n</script>`}
            />
            <div className="flex items-start gap-2 rounded-lg bg-blue-400/5 border border-blue-400/10 px-3.5 py-3">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-400/80 leading-relaxed">
                Após o pagamento no Iframe, a Viva redirecionará o conteúdo do Iframe para a sua{" "}
                <span className="font-medium">Success URL</span> configurada no portal.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Step 3 — Webhooks */}
      <Section>
        <SectionHeader icon={Webhook} title="Receção de Eventos Assíncronos (Webhooks)" step="Step 3" />
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-400">
            O NeXFlowX Maestro monitoriza o ciclo de vida do pagamento junto da VIVA e notifica o seu servidor
            em tempo real sobre qualquer alteração de estado. Os Webhooks são a{" "}
            <span className="text-white font-medium">fonte de verdade</span> para atualizar as encomendas
            na sua base de dados.
          </p>

          {/* Webhook Payload */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Carga Útil do Webhook
            </p>
            <CodeBlock
              filename="Webhook Payload (JSON)"
              code={JSON.stringify({
                reference: "ORD-2026-001",
                type: "TRANSACTION",
                status: "PAID",
                amount: 2500,
                currency: "EUR",
                method: "CARD",
                processor_reference: "e5513d7e-0000-0000-0000-000000000000",
                timestamp: "2026-04-24T10:30:00.000Z",
              }, null, 2)}
            />
          </div>

          {/* Status Table */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Tabela de Estados Possíveis
            </p>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 space-y-1">
              <StatusBadge
                status="PAID"
                color="green"
                description="O pagamento foi capturado com sucesso. Pode aprovar a encomenda e libertar os bens/serviços."
              />
              <div className="h-px bg-neutral-800/50" />
              <StatusBadge
                status="FAILED"
                color="red"
                description="O pagamento foi recusado pelo banco (fundos insuficientes, cartão expirado, fraude). A encomenda deve ser cancelada."
              />
              <div className="h-px bg-neutral-800/50" />
              <StatusBadge
                status="REFUNDED"
                color="amber"
                description="O valor foi total ou parcialmente devolvido ao cliente. A encomenda deve ser ajustada."
              />
              <div className="h-px bg-neutral-800/50" />
              <StatusBadge
                status="PENDING"
                color="blue"
                description="O pagamento foi iniciado mas aguarda validação (estado de transição, não implica entrega de bens)."
              />
            </div>
          </div>

          {/* Validation */}
          <div className="flex items-start gap-2 rounded-lg bg-emerald-400/5 border border-emerald-400/10 px-3.5 py-3">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-400/80 leading-relaxed">
              <span className="font-medium">Validação de Receção:</span> Para que o Maestro considere a notificação
              como entregue com sucesso, o seu servidor deve responder ao webhook com um código de estado{" "}
              <code className="text-emerald-400 bg-emerald-400/10 rounded px-1 py-0.5 text-[11px] font-mono">
                HTTP 200 OK
              </code>
              . Qualquer outro código resultará em novas tentativas de entrega automáticas.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}

// ─── Coming Soon Card ───────────────────────────────────
function ComingSoonCard({ provider }: { provider: Provider }) {
  const Icon = provider.icon
  return (
    <div className="animate-in fade-in duration-300">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
        <div className="p-8 sm:p-12 text-center">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border",
            provider.bgColor, provider.borderColor
          )}>
            <Icon className={cn("w-6 h-6", provider.textColor)} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">{provider.name}</h3>
          <p className="text-sm text-neutral-500 mb-4">{provider.subtitle}</p>
          <div className="inline-flex items-center gap-2 text-xs text-neutral-600 bg-neutral-800/50 rounded-full px-3 py-1.5 border border-neutral-800">
            <Clock className="w-3 h-3" />
            Documentação em preparação
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-800/50">
            <p className="text-xs text-amber-400/70">
              Para suporte imediato, contacte: <span className="font-semibold text-amber-400">Telegram @NeXFlowX_Support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Docs View ─────────────────────────────────────
export function DocsView() {
  const selectedDocsProvider = useAppStore((s) => s.selectedDocsProvider)
  const setSelectedDocsProvider = useAppStore((s) => s.setSelectedDocsProvider)

  const [localProvider, setLocalProvider] = useState<ProviderId>(() => {
    // Read from store on mount (when navigating from Hub)
    const fromStore = useAppStore.getState().selectedDocsProvider
    if (fromStore) {
      useAppStore.getState().setSelectedDocsProvider(null)
      return fromStore
    }
    return "viva"
  })

  const activeProvider = useMemo(
    () => PROVIDERS.find((p) => p.id === localProvider)!,
    [localProvider]
  )

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Documentação de Integração</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Guias de integração por Provider — seleccione o gateway para aceder à documentação técnica
        </p>
      </div>

      {/* Provider Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-thin">
        {PROVIDERS.map((provider) => {
          const Icon = provider.icon
          const isActive = localProvider === provider.id
          return (
            <button
              key={provider.id}
              onClick={() => setLocalProvider(provider.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all whitespace-nowrap shrink-0",
                isActive
                  ? cn(provider.bgColor, provider.borderColor, provider.textColor)
                  : "border-neutral-800 bg-neutral-900/30 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{provider.name}</span>
              {provider.tag && (
                <span className={cn(
                  "text-[9px] font-semibold rounded-full px-1.5 py-px border",
                  provider.hasDocs
                    ? "bg-green-400/10 border-green-400/20 text-green-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-600"
                )}>
                  {provider.tag}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active Provider Content */}
      {activeProvider.hasDocs && activeProvider.id === "viva" ? (
        <VivaDocs />
      ) : (
        <ComingSoonCard provider={activeProvider} />
      )}
    </div>
  )
}
