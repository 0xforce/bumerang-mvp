"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Download, ChevronDown, ArrowUpRight, ArrowDownLeft } from "lucide-react"

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-89234A",
    date: "Oct 12, 2026",
    counterparty: "Acme Corp LLC",
    flow: "USD → USDC",
    amount: "5,000.00",
    status: "Completed",
    type: "outbound",
  },
  {
    id: "TXN-89235B",
    date: "Oct 11, 2026",
    counterparty: "Global Tech Inc",
    flow: "EUR → USD",
    amount: "12,450.00",
    status: "Processing",
    type: "inbound",
  },
  {
    id: "TXN-89236C",
    date: "Oct 10, 2026",
    counterparty: "Amazon Web Services",
    flow: "USD → USD",
    amount: "8,200.50",
    status: "Completed",
    type: "outbound",
  },
  {
    id: "TXN-89237D",
    date: "Oct 09, 2026",
    counterparty: "Stripe Inc",
    flow: "USD → EUR",
    amount: "45,000.00",
    status: "Failed",
    type: "outbound",
  },
  {
    id: "TXN-89238E",
    date: "Oct 08, 2026",
    counterparty: "Apple Inc",
    flow: "USDC → USD",
    amount: "100,000.00",
    status: "Completed",
    type: "inbound",
  },
]

export default function TransactionsPage() {
  const t = useTranslations("Transactions")
  const currencySymbol = t("currencySymbol")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-7xl space-y-8"
    >
      {/* Header & Filters */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-foreground">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-full border-0 bg-card shadow-ambient hover:bg-secondary hover:text-foreground">
            {t("filters.status")} <ChevronDown size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="outline" className="gap-2 rounded-full border-0 bg-card shadow-ambient hover:bg-secondary hover:text-foreground">
            {t("filters.account")} <ChevronDown size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="outline" className="gap-2 rounded-full border-0 bg-card shadow-ambient hover:bg-secondary hover:text-foreground">
            {t("filters.dateRange")} <ChevronDown size={14} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl bg-card p-4 shadow-ambient md:p-8">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="pb-4 pl-6 font-medium">{t("table.id")}</th>
                <th className="pb-4 font-medium">{t("table.date")}</th>
                <th className="pb-4 font-medium">{t("table.counterparty")}</th>
                <th className="pb-4 font-medium">{t("table.flow")}</th>
                <th className="pb-4 text-right font-medium">{t("table.amount")}</th>
                <th className="pb-4 text-center font-medium">{t("table.status")}</th>
                <th className="pb-4 pr-6 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((txn) => {
                const statusLabel =
                  txn.status === "Completed"
                    ? t("statuses.completed")
                    : txn.status === "Processing"
                      ? t("statuses.processing")
                      : t("statuses.failed")

                const statusPillClass =
                  txn.status === "Completed"
                    ? "bg-secondary/50 text-foreground"
                    : txn.status === "Processing"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"

                const amountSign = txn.type === "inbound" ? "+" : "-"

                return (
                  <tr
                    key={txn.id}
                    className="group relative transition-colors hover:bg-secondary/50"
                  >
                    <td className="relative py-5 pl-6">
                      {/* Active Left Border on Hover */}
                      <div className="absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-all duration-300 group-hover:h-3/4 group-hover:opacity-100" />

                      <Link
                        href={`/dashboard/transactions/${txn.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={t("table.viewDetailsAria", { id: txn.id })}
                      />

                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                          {txn.type === "inbound" ? (
                            <ArrowDownLeft size={14} className="text-primary" />
                          ) : (
                            <ArrowUpRight size={14} className="text-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{txn.id}</span>
                      </div>
                    </td>
                    <td className="py-5 text-muted-foreground">{txn.date}</td>
                    <td className="py-5 font-medium text-foreground">{txn.counterparty}</td>
                    <td className="py-5 text-muted-foreground">
                      <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium">
                        {txn.flow}
                      </span>
                    </td>
                    <td className="py-5 text-right font-display text-lg tabular-nums tracking-wide text-foreground">
                      {amountSign}
                      {currencySymbol}
                      {txn.amount}
                    </td>
                    <td className="py-5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${statusPillClass}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-5 pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative z-20 size-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground hover:shadow-ambient"
                        title={t("table.downloadReceipt")}
                      >
                        <Download size={16} strokeWidth={2} />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
