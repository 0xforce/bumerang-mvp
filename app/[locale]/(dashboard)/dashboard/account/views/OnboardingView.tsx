"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { IndividualForm } from "../components/IndividualForm"
import { BusinessForm } from "../components/BusinessForm"

type EntityType = "individual" | "business"

export function OnboardingView({
  onComplete,
  organizationId,
}: {
  onComplete: () => void
  organizationId: string
}) {
  const t = useTranslations("Account.Onboarding")
  const [entityType, setEntityType] = React.useState<EntityType>("individual")

  function handleEntitySwitch(next: EntityType) {
    if (next !== entityType) setEntityType(next)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-3xl bg-card p-8 shadow-ambient md:p-12">
        {/* Entity Type Toggle */}
        <div className="relative mb-10 flex w-full rounded-full bg-secondary/50 p-1">
          {(["individual", "business"] as const).map((type) => {
            const isActive = entityType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleEntitySwitch(type)}
                className={cn(
                  "relative z-10 w-1/2 rounded-full py-2.5 text-sm font-medium capitalize tracking-wide transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="entity-toggle"
                    className="absolute inset-0 -z-10 rounded-full bg-card shadow-ambient"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {t(type)}
              </button>
            )
          })}
        </div>

        {/* Form — keyed so it resets when entity type switches */}
        {entityType === "individual" ? (
          <IndividualForm key="individual" onComplete={onComplete} organizationId={organizationId} />
        ) : (
          <BusinessForm key="business" onComplete={onComplete} organizationId={organizationId} />
        )}
      </div>
    </motion.div>
  )
}
