"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  Check,
  RefreshCw,
  Lock,
  Info,
  Headset,
  Shield,
} from "lucide-react"

import { useTranslations } from "next-intl"
import type { VerificationStatus } from "@/lib/verification-status"
import { cn } from "@/lib/utils"

type StepState = "complete" | "active" | "upcoming"

function stepStates(status: VerificationStatus): [StepState, StepState, StepState] {
  if (status === "PENDING") return ["complete", "active", "upcoming"]
  if (status === "PROCESSING") return ["complete", "active", "upcoming"]
  if (status === "SHUFTI_APPROVED") return ["complete", "complete", "active"]
  return ["complete", "active", "upcoming"]
}

export function PendingView({ status }: { status: VerificationStatus }) {
  const t = useTranslations("Account.Pending")
  const [s1, s2, s3] = stepStates(status)

  const phaseKey =
    status === "PENDING" || status === "PROCESSING" || status === "SHUFTI_APPROVED"
      ? status
      : "PENDING"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-6xl space-y-8"
    >
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {t(`phase.${phaseKey}.title`)}
        </h1>
        <p className="mt-1 text-muted-foreground">{t(`phase.${phaseKey}.subtitle`)}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card p-10 text-center shadow-ambient md:p-16">
            <div className="mb-8 flex size-24 items-center justify-center rounded-3xl bg-secondary/50 text-primary">
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>

            <div
              className="mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: "var(--badge-success-bg)",
                color: "var(--badge-success-fg)",
              }}
            >
              {t("documentsSubmitted")}
            </div>

            <h2 className="mb-4 font-display text-2xl tracking-wide text-foreground md:text-3xl">
              {t(`phase.${phaseKey}.headline`)}
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              {t(`phase.${phaseKey}.body`)}
            </p>

            <div className="mt-10 flex w-full max-w-md flex-col justify-center gap-8 border-t border-border/40 pt-8 sm:flex-row sm:gap-16">
              <div className="flex flex-col items-center">
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("queueId")}
                </span>
                <span className="font-medium text-foreground">—</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("expectedTime")}
                </span>
                <span className="font-medium text-foreground">{t("expectedTimeValue")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-secondary/30 p-6 sm:flex-row sm:items-start md:p-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{t("needUpdate")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("updateDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl bg-card p-8 shadow-ambient">
            <h3 className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("progressTitle")}
            </h3>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-border before:to-transparent lg:before:ml-5 lg:before:-translate-x-px">
              <TimelineRow
                state={s1}
                title={t("timeline.step1Title")}
                desc={t("timeline.step1Desc")}
              />
              <TimelineRow
                state={s2}
                title={t("timeline.step2Title")}
                desc={
                  status === "PROCESSING"
                    ? t("timeline.step2ActiveDesc")
                    : status === "PENDING"
                      ? t("timeline.step2QueueDesc")
                      : t("timeline.step2DoneDesc")
                }
                spin={status === "PROCESSING" && s2 === "active"}
              />
              <TimelineRow
                state={s3}
                title={t("timeline.step3Title")}
                desc={
                  status === "SHUFTI_APPROVED"
                    ? t("timeline.step3ActiveDesc")
                    : t("timeline.step3WaitingDesc")
                }
              />
            </div>

            <Button
              variant="secondary"
              className="mt-10 w-full gap-2 bg-secondary/50 hover:bg-secondary hover:text-foreground"
            >
              <Headset size={16} strokeWidth={1.5} />
              {t("contactSupport")}
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-secondary/80 to-secondary/30 p-8">
            <div className="absolute -right-6 -top-6 text-foreground/5 dark:text-foreground/10">
              <Shield size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <h3 className="font-medium text-foreground">{t("securityTitle")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("securityDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TimelineRow({
  state,
  title,
  desc,
  spin,
}: {
  state: StepState
  title: string
  desc: string
  spin?: boolean
}) {
  const isComplete = state === "complete"
  const isActive = state === "active"

  return (
    <div className="relative flex items-start gap-4">
      <div
        className={cn(
          "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
          isComplete && "bg-primary text-primary-foreground",
          isActive && "bg-primary/10 text-primary",
          !isComplete && !isActive && "bg-secondary text-muted-foreground",
        )}
      >
        {isComplete ? (
          <Check size={18} strokeWidth={2.5} />
        ) : isActive && spin ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <RefreshCw size={18} strokeWidth={2} />
          </motion.div>
        ) : isActive ? (
          <RefreshCw size={18} strokeWidth={2} />
        ) : (
          <Lock size={18} strokeWidth={2} />
        )}
      </div>
      <div className="pt-1">
        <p
          className={cn(
            "font-medium",
            isComplete || isActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-xs",
            isActive ? "font-medium text-primary" : "text-muted-foreground/80",
          )}
        >
          {desc}
        </p>
      </div>
    </div>
  )
}
