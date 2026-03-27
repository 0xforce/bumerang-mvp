"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react"

const MOCK_RECENT_TXNS = [
  { id: "TXN-89234A", amount: "50,000.00", status: "Completed", type: "outbound", counterparty: "Acme Corp LLC", flow: "USD → USDC" },
  { id: "TXN-89235B", amount: "12,450.00", status: "Processing", type: "inbound", counterparty: "Global Tech Inc", flow: "EUR → USD" },
  { id: "TXN-89236C", amount: "8,200.50", status: "Completed", type: "outbound", counterparty: "Amazon Web Services", flow: "USD → USD" },
  { id: "TXN-89237D", amount: "45,000.00", status: "Failed", type: "outbound", counterparty: "Stripe Inc", flow: "USD → EUR" },
  { id: "TXN-89238E", amount: "100,000.00", status: "Completed", type: "inbound", counterparty: "Apple Inc", flow: "USDC → USD" },
] as const

const STATUS_STYLE: Record<
  (typeof MOCK_RECENT_TXNS)[number]["status"],
  React.CSSProperties
> = {
  Completed: {
    backgroundColor: "var(--badge-success-bg)",
    color: "var(--badge-success-fg)",
  },
  Processing: {
    backgroundColor: "var(--badge-processing-bg)",
    color: "var(--badge-processing-fg)",
  },
  Failed: {
    backgroundColor: "var(--badge-failed-bg)",
    color: "var(--badge-failed-fg)",
  },
}

export function DashboardRecentTransactions() {
  const t = useTranslations("Dashboard.recentTransactions")

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-card p-6 shadow-ambient md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("title")}
        </h3>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t("viewAll")} <ArrowRight size={16} />
        </Link>
      </div>

      <div className="-mx-6 -mb-6 md:-mx-8 md:-mb-8">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <tbody className="divide-y divide-transparent">
              {MOCK_RECENT_TXNS.map((txn) => (
                <tr
                  key={txn.id}
                  className="group relative transition-colors hover:bg-secondary/50"
                >
                  <td className="relative py-4 pl-6 md:pl-8">
                    {/* Active Left Border on Hover */}
                    <div className="absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-all duration-300 group-hover:h-3/4 group-hover:opacity-100" />
                    
                    <Link
                      href={`/dashboard/transactions/${txn.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={t("viewDetailsAria", { id: txn.id })}
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                        {txn.type === "inbound" ? (
                          <ArrowDownLeft size={14} className="text-primary" />
                        ) : (
                          <ArrowUpRight size={14} className="text-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{txn.counterparty}</span>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">
                    <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium">
                      {txn.flow}
                    </span>
                  </td>
                  <td className="py-4 text-right font-display text-lg tabular-nums tracking-wide text-foreground">
                    {txn.type === "inbound" ? "+" : "-"}${txn.amount}
                  </td>
                  <td className="py-4 pr-6 text-right md:pr-8">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                      style={STATUS_STYLE[txn.status]}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
