"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export function SecurityTab() {
  const t = useTranslations("Settings.security")
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false)

  return (
    <div className="rounded-3xl bg-card p-6 shadow-ambient sm:p-8 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 text-foreground">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-medium text-foreground">{t("twoFactorTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("twoFactorDesc")}</p>
            <div className="pt-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                  is2FAEnabled
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {is2FAEnabled ? t("enabled") : t("disabled")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={setIs2FAEnabled}
            className="data-[state=checked]:bg-primary"
          />
          {is2FAEnabled && (
            <Button variant="outline" className="rounded-full hover:bg-secondary hover:text-foreground">
              {t("configureApp")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
