"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Mail, Bell } from "lucide-react"

export function PreferencesTab() {
  const t = useTranslations("Settings.preferences")
  const [emailNotifs, setEmailNotifs] = React.useState(true)

  return (
    <div className="space-y-6">
      {/* Newsletter Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-card to-secondary/30 p-8 shadow-ambient md:p-10">
        <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Mail size={14} />
              {t("newsletter.badge")}
            </div>
            <h3 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">
              {t("newsletter.title")}
            </h3>
            <p className="mt-3 text-muted-foreground">
              {t("newsletter.desc")}
            </p>
          </div>
          <Button className="shrink-0 rounded-full px-8 py-6">
            {t("newsletter.subscribe")}
          </Button>
        </div>

        {/* Abstract Graphic Placeholder */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 z-0 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 -top-12 z-0 size-64 rounded-full bg-primary/5 blur-2xl" />
      </div>

      {/* Notifications Settings */}
      <div className="rounded-3xl bg-card p-6 shadow-ambient sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 text-foreground">
              <Bell size={24} strokeWidth={1.5} />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-medium text-foreground">{t("notifications.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("notifications.desc")}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Switch
              checked={emailNotifs}
              onCheckedChange={setEmailNotifs}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
