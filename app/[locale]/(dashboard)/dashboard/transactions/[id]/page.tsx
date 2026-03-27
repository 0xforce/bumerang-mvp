"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  Building2,
  Wallet,
  Copy,
  Download,
} from "lucide-react"

// Mock data fetcher for the detail view
const getMockTxn = (id: string) => ({
  id,
  date: "Oct 12, 2026, 14:32:05 UTC",
  status: "Processing", // Can be "Completed", "Processing", "Failed"
  type: "outbound",
  sendAmount: "5,000.00",
  sendCurrency: "USD",
  receiveAmount: "4,985.00",
  receiveCurrency: "USDC",
  exchangeRate: "1 USD = 0.9997 USDC",
  fees: {
    network: "$5.00",
    markup: "$10.00",
    total: "$15.00",
  },
  counterparty: {
    name: "Acme Corp LLC",
    type: "Business",
    account: "0x7a59...3f2b",
    network: "Ethereum (ERC-20)",
  },
  instructions: {
    bank: "Chase Bank NA",
    routing: "021000021",
    account: "8829100293",
    reference: id,
  },
})

export default function TransactionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const t = useTranslations("Transactions.detail")
  const transactionsT = useTranslations("Transactions")
  const tableT = useTranslations("Transactions.table")
  const txn = getMockTxn(params.id)

  const statusLabel =
    txn.status === "Completed"
      ? transactionsT("statuses.completed")
      : txn.status === "Processing"
        ? transactionsT("statuses.processing")
        : transactionsT("statuses.failed")

  const statusPillClass =
    txn.status === "Completed"
      ? "bg-secondary/50 text-foreground"
      : txn.status === "Processing"
        ? "bg-primary/10 text-primary"
        : "bg-destructive/10 text-destructive"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-6xl space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            {t("back")}
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl tracking-wide text-foreground md:text-4xl">
              {txn.id}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${statusPillClass}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{txn.date}</p>
        </div>
        <div>
          <Button
            variant="outline"
            className="gap-2 rounded-full border-0 bg-card shadow-ambient hover:bg-secondary hover:text-foreground"
          >
            <Download size={16} />
            {tableT("downloadReceipt")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Main Flow (8 cols) */}
        <div className="space-y-8 lg:col-span-8">
          
          {/* Section A: The Overview (BOLDER) */}
          <div className="rounded-2xl bg-card p-6 shadow-ambient sm:p-8 md:p-10 lg:p-12">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
              {/* Send Amount */}
              <div className="flex flex-1 flex-col items-center rounded-2xl bg-secondary/30 p-5 text-center sm:p-6 md:items-start md:text-left min-w-0">
                <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("sendAmount")}
                </span>
                <div className="flex w-full flex-wrap items-baseline justify-center gap-1.5 md:justify-start">
                  <span className="font-display text-3xl tabular-nums tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl wrap-break-word">
                    {txn.sendAmount}
                  </span>
                  <span className="font-display text-lg text-muted-foreground sm:text-xl shrink-0">
                    {txn.sendCurrency}
                  </span>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary md:rotate-0 rotate-90">
                <ArrowRight size={20} strokeWidth={2} />
              </div>

              {/* Receive Amount */}
              <div className="flex flex-1 flex-col items-center rounded-2xl bg-secondary/30 p-5 text-center sm:p-6 md:items-end md:text-right min-w-0">
                <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("receiveAmount")}
                </span>
                <div className="flex w-full flex-wrap items-baseline justify-center gap-1.5 md:justify-end">
                  <span className="font-display text-3xl tabular-nums tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl wrap-break-word">
                    {txn.receiveAmount}
                  </span>
                  <span className="font-display text-lg text-muted-foreground sm:text-xl shrink-0">
                    {txn.receiveCurrency}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-xs font-medium text-muted-foreground sm:text-sm">
                <RefreshCw size={14} className="shrink-0" />
                <span className="truncate">{t("exchangeRate")}: <span className="text-foreground">{txn.exchangeRate}</span></span>
              </div>
            </div>
          </div>

          {/* Section B: Fee Breakdown (QUIETER) */}
          <div className="rounded-2xl bg-card p-8 shadow-ambient md:p-12">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("feeBreakdown")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground/80">
                <span>{t("networkFee")}</span>
                <span className="tabular-nums">{txn.fees.network}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground/80">
                <span>{t("markup")}</span>
                <span className="tabular-nums">{txn.fees.markup}</span>
              </div>
              <div className="my-4 h-px w-full bg-border/40" />
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>{t("totalFees")}</span>
                <span className="tabular-nums">{txn.fees.total}</span>
              </div>
            </div>
          </div>

          {/* Section C: Live Timeline */}
          <div className="rounded-2xl bg-card p-8 shadow-ambient md:p-12">
            <h3 className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("timeline")}
            </h3>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-border before:to-transparent">
              {/* Step 1: Created */}
              <div className="relative flex items-start gap-6">
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground shadow-ambient">
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div className="pt-2">
                  <p className="font-medium text-foreground">{t("steps.created")}</p>
                </div>
              </div>

              {/* Step 2: Received */}
              <div className="relative flex items-start gap-6">
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground shadow-ambient">
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div className="pt-2">
                  <p className="font-medium text-foreground">{t("steps.received")}</p>
                </div>
              </div>

              {/* Step 3: Processing (Active) */}
              <div className="relative flex items-start gap-6">
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-card">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  >
                    <RefreshCw size={18} strokeWidth={2} />
                  </motion.div>
                </div>
                <div className="pt-2">
                  <p className="font-medium text-foreground">{t("steps.processing")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("steps.processingDesc")}
                  </p>
                </div>
              </div>

              {/* Step 4: Delivered (Pending) */}
              <div className="relative flex items-start gap-6">
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-4 ring-card">
                  <div className="size-2.5 rounded-full bg-muted-foreground/40" />
                </div>
                <div className="pt-2">
                  <p className="font-medium text-muted-foreground">{t("steps.delivered")}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Metadata & Instructions (4 cols) */}
        <div className="space-y-8 lg:col-span-4">
          
          {/* Section D: Counterparty Info */}
          <div className="rounded-2xl bg-card p-8 shadow-ambient">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("counterpartyInfo")}
            </h3>
            
            <div className="mb-8 flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 text-foreground">
                <Building2 size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium text-foreground">{txn.counterparty.name}</p>
                <p className="text-sm text-muted-foreground">{txn.counterparty.type}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-secondary/30 p-5">
              <div>
                <p className="text-xs text-muted-foreground">{t("counterparty.network")}</p>
                <p className="font-medium text-foreground">{txn.counterparty.network}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("counterparty.accountAddress")}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm font-medium text-foreground">{txn.counterparty.account}</p>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sending Instructions (Conditional based on status) */}
          {txn.status === "Processing" && (
            <div className="rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 p-8 border border-primary/10">
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-primary">
                {t("sendingInstructions")}
              </h3>
              <p className="mb-6 text-sm text-foreground/80">
                {t("sendingInstructionsBody")}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <span className="text-sm text-muted-foreground">{t("sendingInstructionsLabels.bank")}</span>
                  <span className="font-medium text-foreground">{txn.instructions.bank}</span>
                </div>
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <span className="text-sm text-muted-foreground">{t("sendingInstructionsLabels.routing")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-foreground">{txn.instructions.routing}</span>
                    <button className="text-primary hover:text-primary/80"><Copy size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <span className="text-sm text-muted-foreground">{t("sendingInstructionsLabels.account")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-foreground">{txn.instructions.account}</span>
                    <button className="text-primary hover:text-primary/80"><Copy size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-muted-foreground">{t("sendingInstructionsLabels.reference")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-foreground">{txn.instructions.reference}</span>
                    <button className="text-primary hover:text-primary/80"><Copy size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  )
}
