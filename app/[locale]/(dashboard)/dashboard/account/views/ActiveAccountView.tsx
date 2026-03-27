"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowDownLeft, ArrowUpRight, Wallet, Building2, Clock } from "lucide-react"
import { CertificateModal } from "./CertificateModal"
import { useTranslations } from "next-intl"

const MOCK_ACCOUNTS = [
  {
    id: "acc_1",
    name: "USD Operating Account",
    provider: "PORTAGE",
    balance: "$1,245,000.00",
    currency: "USD",
    icon: Building2,
  },
  {
    id: "acc_2",
    name: "Treasury Wallet",
    provider: "TRON",
    balance: "450,200.50",
    currency: "USDT",
    icon: Wallet,
  },
]

const MOCK_TRANSACTIONS = [
  {
    id: "tx_1",
    type: "Inbound",
    counterparty: "Acme Corp LLC",
    amount: "+$50,000.00",
    date: "Today, 10:24 AM",
    status: "Completed",
  },
  {
    id: "tx_2",
    type: "Outbound",
    counterparty: "AWS Cloud Services",
    amount: "-$12,450.00",
    date: "Yesterday, 2:15 PM",
    status: "Completed",
  },
  {
    id: "tx_3",
    type: "Outbound",
    counterparty: "Global Contractors Inc",
    amount: "-$8,000.00",
    date: "Mar 18, 9:00 AM",
    status: "Pending",
  },
]

export function ActiveAccountView() {
  const t = useTranslations("Account.Active")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-5xl space-y-12"
    >
      {/* Header & Quick Actions */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <Button className="gap-2">
            <ArrowDownLeft size={16} />
            {t("createInbound")}
          </Button>
          <Button variant="secondary" className="gap-2">
            <ArrowUpRight size={16} />
            {t("createOutbound")}
          </Button>
        </div>
      </div>

      {/* Account Details (Virtual Accounts) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("virtualAccounts")}
          </h2>
          <CertificateModal />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {MOCK_ACCOUNTS.map((acc) => (
            <div
              key={acc.id}
              className="group relative overflow-hidden rounded-3xl bg-card p-8 shadow-ambient transition-all hover:scale-[1.01]"
            >
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/50 text-foreground">
                    <acc.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{acc.name}</h3>
                    <p className="text-sm text-muted-foreground">{t("via")} {acc.provider}</p>
                  </div>
                </div>
                <div className="rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {acc.currency}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("availableBalance")}</p>
                <p className="mt-1 font-display text-4xl tabular-nums tracking-wide text-foreground">
                  {acc.balance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="space-y-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("recentTransactions")}
        </h2>
        <div className="flex flex-col gap-4">
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl bg-card p-6 shadow-ambient transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-foreground">
                    {tx.type === "Inbound" ? (
                      <ArrowDownLeft size={16} className="text-primary" />
                    ) : (
                      <ArrowUpRight size={16} className="text-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.counterparty}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={12} />
                      {tx.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`font-medium tabular-nums ${
                        tx.type === "Inbound" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tx.amount}
                    </span>
                    {tx.status === "Completed" ? (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: "var(--badge-success-bg)",
                          color: "var(--badge-success-fg)",
                        }}
                      >
                        {t("completed")}
                      </span>
                    ) : (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: "var(--badge-processing-bg)",
                          color: "var(--badge-processing-fg)",
                        }}
                      >
                        {t("pending")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      </section>
    </motion.div>
  )
}
