"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"

export function DashboardEducation() {
  const t = useTranslations("Dashboard.education")

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-card to-secondary/30 p-8 shadow-ambient md:p-10">
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <BookOpen size={14} />
            {t("badge")}
          </div>
          <h3 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">
            {t("title")}
          </h3>
          <p className="mt-3 text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button className="shrink-0 gap-2 rounded-full px-8 py-6">
          {t("readGuide")}
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Abstract Graphic Placeholder */}
      <div className="pointer-events-none absolute -bottom-24 -right-24 z-0 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -top-12 z-0 size-64 rounded-full bg-primary/5 blur-2xl" />
    </div>
  )
}
