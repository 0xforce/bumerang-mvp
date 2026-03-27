"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, ArrowRight } from "lucide-react"
import type { VerificationStatus } from "@/lib/verification-status"
import {
  isRejected,
  isVerificationApproved,
  isVerificationInFlight,
} from "@/lib/verification-status"

interface DashboardBannerProps {
  verificationStatus: VerificationStatus
}

export function DashboardBanner({ verificationStatus }: DashboardBannerProps) {
  const t = useTranslations("Dashboard.banner")

  if (isVerificationApproved(verificationStatus)) return null

  if (isRejected(verificationStatus)) {
    return (
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-destructive/10 px-6 py-5 sm:flex-row sm:items-center md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-medium text-destructive">{t("rejectedTitle")}</p>
            <p className="mt-0.5 text-sm text-destructive/80">{t("rejectedSubtitle")}</p>
          </div>
        </div>
        <Link href="/dashboard/account">
          <Button
            variant="secondary"
            className="w-full shrink-0 gap-2 rounded-full sm:w-auto"
          >
            {t("rejectedCta")}
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    )
  }

  if (isVerificationInFlight(verificationStatus)) {
    return (
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-secondary px-6 py-5 sm:flex-row sm:items-center md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-foreground">
            <Clock size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {t(`phase.${verificationStatus}.title`)}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t(`phase.${verificationStatus}.subtitle`)}
            </p>
          </div>
        </div>
        <Link href="/dashboard/account">
          <Button
            variant="secondary"
            className="w-full shrink-0 gap-2 rounded-full sm:w-auto"
          >
            {t("inFlightCta")}
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    )
  }

  // UNVERIFIED — complete profile CTA
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-primary/10 px-6 py-5 sm:flex-row sm:items-center md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <AlertCircle size={20} strokeWidth={2} />
        </div>
        <p className="font-medium text-primary">
          {t("unverifiedTitle")}
        </p>
      </div>
      <Link href="/dashboard/account">
        <Button className="w-full shrink-0 gap-2 rounded-full sm:w-auto">
          {t("unverifiedCta")}
          <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  )
}
