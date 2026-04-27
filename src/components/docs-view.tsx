"use client"

import { useState, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import {
  Copy,
  Check,
  CreditCard,
  Wallet,
  Smartphone,
  Shield,
  ArrowRight,
  Code2,
  Webhook,
  Info,
  Zap,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
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
              <h2 className="text-base font-semibold text-white">NeXFlowX Payment Maestro</h2>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                Smart Checkout
              </span>
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-2 py-0.5">
                v2.2
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              A <span className="text-emerald-400 font-medium">NeXFlowX</span> atua como uma camada de orquestração financeira{" "}
              <span className="text-white font-medium">(Financial Supply Chain)</span>. Toda a comunicação é efetuada através
              do nosso Proxy Maestro, garantindo que a infraestrutura bancária subjacente permanece invisível para o utilizador final
              e para as aplicações de consumo.
            </p>
          </div>
        </div>

        {/* Flow Steps Overview */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Code2, label: "1. Inicializar Sessão", desc: "Backend — Criar ordem de pagamento" },
            { icon: Globe, label: "2. Interface de Pagamento", desc: "Frontend — Iframe Embutido" },
            { icon: Webhook, label: "3. Receber Webhook", desc: "Servidor — Notificação de estado" },
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

      {/* Autenticação */}
      <Section>
        <SectionHeader icon={Lock} title="Autenticação" step="Auth" />
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-400">
            Todas as chamadas à API devem incluir a chave de segurança no cabeçalho:
          </p>
          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
            <div className="flex items-center gap-3">
              <code className="text-xs font-mono text-amber-400 w-36 shrink-0">x-proxy-key</code>
              <code className="text-xs font-mono text-neutral-300">sk_proxy_nexor_nex13467928x04x2026</code>
            </div>
          </div>
        </div>
      </Section>

      {/* Step 1 — Initialize Payment Session */}
      <Section>
        <SectionHeader icon={Code2} title="Inicializar Sessão (Server-to-Server)" step="Step 1" />
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-400">
            O vosso backend solicita a criação de uma ordem de pagamento. O montante deve ser enviado em Euros (decimal).
          </p>

          {/* Endpoint Badge */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-md px-2 py-0.5">
                POST
              </span>
              <code className="text-xs font-mono text-neutral-300 bg-neutral-800/50 border border-neutral-700 rounded-md px-2.5 py-1 break-all">
                https://proxy.nexflowx.tech/relay/{NODE_ID}/payments
              </code>
            </div>
            {/* Nodes Available */}
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Nodes Disponíveis</p>
              <div className="flex flex-wrap gap-2">
                {["VIVA_PT_001", "VIVA_PT_002"].map((node) => (
                  <span key={node} className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-md px-2 py-1">
                    {node}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Request Body */}
          <CodeBlock
            filename="Request Body (JSON)"
            code={JSON.stringify(
              {
                amount: 10.5,
                method: "SMART_CHECKOUT",
                reference: "NEXOR_ORDER_9988",
              },
              null,
              2,
            )}
          />

          {/* Params Table */}
          <ParamTable
            params={[
              { name: "amount", type: "number (decimal)", description: 'Montante do pagamento em Euros, formato decimal (ex: 10.50).' },
              { name: "method", type: "string", description: 'Método de pagamento. Para VIVA Smart Checkout utilizar: "SMART_CHECKOUT".' },
              { name: "reference", type: "string", description: "Identificador único da ordem no seu sistema. Será devolvido nos webhooks para reconciliation." },
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
              code={JSON.stringify(
                {
                  status: "PENDING",
                  transactionId: "NEXOR_ORDER_9988",
                  gateway_id: "4890479297281138",
                },
                null,
                2,
              )}
            />
          </div>
        </div>
      </Section>

      {/* Step 2 — Frontend Integration (Iframe) */}
      <Section>
        <SectionHeader icon={Globe} title="Interface de Pagamento (Frontend)" step="Step 2" />
        <div className="p-5 space-y-5">
          <p className="text-sm text-neutral-400">
            Utilizem o <span className="text-white font-medium">gateway_id</span> recebido para carregar a interface.
            O URL base é:
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-md px-2 py-0.5">
              BASE URL
            </span>
            <code className="text-xs font-mono text-neutral-300 bg-neutral-800/50 border border-neutral-700 rounded-md px-2.5 py-1 break-all">
              https://www.vivapayments.com/web/checkout?ref={gateway_id}
            </code>
          </div>

          {/* Iframe Embed (Recommended) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
                Recomendado
              </span>
              <h4 className="text-sm font-semibold text-white">Iframe Embutido</h4>
            </div>
            <p className="text-xs text-neutral-500">
              Esta opção mantém o utilizador no vosso ecossistema.
            </p>
            <CodeBlock
              filename="HTML"
              language="html"
              code={`<iframe\n  src="https://www.vivapayments.com/web/checkout?ref=4890479297281138"\n  allow="payment"\n  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"\n  style="width: 100%; height: 650px; border: none; border-radius: 12px; background: transparent;"\n></iframe>`}
            />

            {/* Critical Alerts */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-lg bg-red-400/5 border border-red-400/10 px-3.5 py-3">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div className="text-xs text-red-400/80 leading-relaxed">
                  <span className="font-semibold">Atributo allow="payment":</span> Obrigatório. Sem esta flag, o browser bloqueia o Apple Pay,
                  Google Pay e a biometria necessária para o 3D Secure 2.0 (SCA).
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-amber-400/5 border border-amber-400/10 px-3.5 py-3">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-400/80 leading-relaxed">
                  <span className="font-semibold">Dimensionamento:</span> Recomendamos uma altura mínima de 650px para garantir que os métodos de pagamento
                  e botões de submissão estão sempre visíveis sem scroll interno excessivo.
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-blue-400/5 border border-blue-400/10 px-3.5 py-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-400/80 leading-relaxed">
                  <span className="font-semibold">Cross-Origin:</span> O checkout emite eventos via postMessage. O vosso frontend pode escutar
                  estes eventos para fechar o modal automaticamente em caso de sucesso.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Step 3 — Webhooks */}
      <Section>
        <SectionHeader icon={Webhook} title="Notificação de Estado (Webhooks)" step="Step 3" />
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-400">
            Assim que o pagamento for processado, o Maestro envia uma notificação para o vosso servidor.
          </p>

          {/* Webhook Payload */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Webhook Payload
            </p>
            <CodeBlock
              filename="Webhook Payload (JSON)"
              code={JSON.stringify(
                {
                  reference: "NEXOR_ORDER_9988",
                  type: "TRANSACTION",
                  status: "PAID",
                  amount: 10.5,
                  currency: "EUR",
                  method: "CARD",
                  processor_reference: "4890479297281138",
                  timestamp: "2026-04-27T10:53:00Z",
                },
                null,
                2,
              )}
            />
          </div>

          {/* Status Table */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Estados Possíveis
            </p>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 space-y-1">
              <StatusBadge
                status="PAID"
                color="green"
                description="Pagamento confirmado. Libertar bens/serviços."
              />
              <div className="h-px bg-neutral-800/50" />
              <StatusBadge
                status="FAILED"
                color="red"
                description="Transação recusada ou cancelada."
              />
              <div className="h-px bg-neutral-800/50" />
              <StatusBadge
                status="PENDING"
                color="blue"
                description="Aguarda ação do utilizador (ex: referência gerada)."
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
