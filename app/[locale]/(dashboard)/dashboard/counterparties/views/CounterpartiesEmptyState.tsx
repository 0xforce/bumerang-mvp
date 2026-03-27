"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { AddCounterpartyDialog } from "./AddCounterpartyDialog"
import { Button } from "@/components/ui/button"

import { Users } from "lucide-react"

export function CounterpartiesEmptyState({ organizationId }: { organizationId: string }) {
  const t = useTranslations("Counterparties.empty")

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center rounded-3xl bg-card px-6 py-24 shadow-ambient">
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 flex size-24 items-center justify-center rounded-3xl bg-secondary/50 text-muted-foreground">
          <Users size={48} strokeWidth={1.5} />
        </div>

        <h2 className="font-display text-3xl tracking-wide text-foreground">
          {t("headline")}
        </h2>
        
        <p className="mt-4 text-muted-foreground">
          {t("subheadline")}
        </p>

        <div className="mt-10">
          <AddCounterpartyDialog organizationId={organizationId}>
            <Button className="rounded-full px-8 shadow-ambient">
              {t("cta")}
            </Button>
          </AddCounterpartyDialog>
        </div>
      </div>
    </div>
  )
}
