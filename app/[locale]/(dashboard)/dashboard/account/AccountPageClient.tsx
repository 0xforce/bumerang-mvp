"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "@/i18n/routing"
import { OnboardingView } from "./views/OnboardingView"
import { PendingView } from "./views/PendingView"
import { ActiveAccountView } from "./views/ActiveAccountView"
import { RejectedView } from "./views/RejectedView"
import { useTranslations } from "next-intl"
import type { VerificationStatus } from "@/lib/verification-status"
import {
  isRejected,
  isVerificationApproved,
  isVerificationInFlight,
} from "@/lib/verification-status"

const DEV_STATUSES: VerificationStatus[] = [
  "UNVERIFIED",
  "PENDING",
  "PROCESSING",
  "SHUFTI_APPROVED",
  "APPROVED",
  "REJECTED",
]

export function AccountPageClient({
  verificationStatus: initialStatus,
  organizationId,
}: {
  verificationStatus: VerificationStatus
  organizationId: string
}) {
  const router = useRouter()
  const [devOverride, setDevOverride] = React.useState<VerificationStatus | null>(null)
  const t = useTranslations("Account")

  const verificationStatus = devOverride ?? initialStatus

  const onSubmitted = React.useCallback(() => {
    router.refresh()
  }, [router])

  const showDevPanel = true // TODO: Quitar después de la presentación

  const main = (() => {
    if (isVerificationApproved(verificationStatus)) {
      return <ActiveAccountView key="approved" />
    }
    if (isRejected(verificationStatus)) {
      return <RejectedView key="rejected" />
    }
    if (isVerificationInFlight(verificationStatus)) {
      return <PendingView key="pending" status={verificationStatus} />
    }
    return (
      <OnboardingView
        key="unverified"
        onComplete={onSubmitted}
        organizationId={organizationId}
      />
    )
  })()

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full">
      <AnimatePresence mode="wait">{main}</AnimatePresence>

      {showDevPanel && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-[min(100vw-2rem,28rem)] flex-wrap items-center gap-2 rounded-2xl border border-border/40 bg-card p-2 shadow-ambient backdrop-blur-md">
          <span className="w-full pl-3 pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("devState")}
          </span>
          {DEV_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDevOverride(s)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                (devOverride ?? initialStatus) === s
                  ? "bg-foreground text-background"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDevOverride(null)}
            className="rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            {t("devReset")}
          </button>
        </div>
      )}
    </div>
  )
}
