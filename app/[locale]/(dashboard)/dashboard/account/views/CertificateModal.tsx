"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download } from "lucide-react"
import { useTranslations } from "next-intl"

export function CertificateModal() {
  const t = useTranslations("Account.CertificateModal")
  const [currency, setCurrency] = React.useState<"USD" | "EUR">("USD")
  const [network, setNetwork] = React.useState<string>("SWIFT")

  const networks = currency === "USD" ? ["SWIFT", "Wire/ACH"] : ["SWIFT", "SEPA"]

  // Reset network if it's no longer valid for the selected currency
  React.useEffect(() => {
    if (currency === "EUR" && network === "Wire/ACH") setNetwork("SEPA")
    if (currency === "USD" && network === "SEPA") setNetwork("Wire/ACH")
  }, [currency, network])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          {useTranslations("Account.Active")("downloadCertificate")}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-card p-8 shadow-ambient sm:max-w-md sm:rounded-[2rem]">
        <DialogHeader className="mb-6">
          <DialogTitle className="font-display text-2xl tracking-wide text-foreground">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Currency Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("selectCurrency")}
            </label>
            <div className="relative flex w-full rounded-full bg-secondary/50 p-1">
              {["USD", "EUR"].map((c) => {
                const isActive = currency === c
                return (
                  <button
                    key={c}
                    onClick={() => setCurrency(c as "USD" | "EUR")}
                    className={cn(
                      "relative z-10 w-1/2 rounded-full py-2.5 text-sm font-medium tracking-wide transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="modal-currency"
                        className="absolute inset-0 -z-10 rounded-full bg-card shadow-ambient"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Network Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("selectNetwork")}
            </label>
            <div className="relative flex w-full rounded-full bg-secondary/50 p-1">
              {networks.map((n) => {
                const isActive = network === n
                return (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={cn(
                      "relative z-10 flex-1 rounded-full py-2.5 text-sm font-medium tracking-wide transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="modal-network"
                        className="absolute inset-0 -z-10 rounded-full bg-card shadow-ambient"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {n}
                  </button>
                )
              })}
            </div>
          </div>

          <Button className="w-full">{t("generatePdf")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
