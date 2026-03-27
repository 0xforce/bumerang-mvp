"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Headset } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export function RejectedView() {
  const t = useTranslations("Account.Rejected")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl space-y-8"
    >
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="rounded-3xl border border-destructive/20 bg-card p-10 shadow-ambient md:p-12">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle size={28} strokeWidth={1.5} />
        </div>
        <p className="text-base leading-relaxed text-foreground">{t("body")}</p>
        <p className="mt-4 text-sm text-muted-foreground">{t("hint")}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/settings">{t("ctaSettings")}</Link>
          </Button>
          <Button variant="secondary" className="gap-2 rounded-full bg-secondary/80">
            <Headset size={16} strokeWidth={1.5} />
            {t("ctaSupport")}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
