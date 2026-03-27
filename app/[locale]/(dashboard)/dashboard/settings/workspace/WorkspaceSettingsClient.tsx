"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter } from "@/i18n/routing"
import { ArrowLeft, Loader2, LogOut, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  updateWorkspaceName,
  leaveOrganization,
  deleteWorkspace,
} from "@/actions/workspace"
import { updateWorkspaceNamePayloadSchema } from "@/lib/validations/workspace"
import { useConfirm } from "@/hooks/use-confirm"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { z } from "zod"

type NameForm = z.infer<typeof updateWorkspaceNamePayloadSchema>

export function WorkspaceSettingsClient({
  organizationId,
  initialDisplayName,
  memberCount,
  currentUserRole,
}: {
  organizationId: string
  initialDisplayName: string
  memberCount: number
  currentUserRole: string
}) {
  const t = useTranslations("Settings.workspace")
  const locale = useLocale()
  const router = useRouter()
  const confirm = useConfirm()

  const isAdmin = currentUserRole === "admin"
  const canLeave = memberCount > 1

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NameForm>({
    resolver: zodResolver(updateWorkspaceNamePayloadSchema),
    defaultValues: { name: initialDisplayName },
  })

  React.useEffect(() => {
    reset({ name: initialDisplayName })
  }, [initialDisplayName, reset])

  const [destructivePending, setDestructivePending] = React.useState<"leave" | "delete" | null>(null)

  async function onSaveName(data: NameForm) {
    const result = await updateWorkspaceName(organizationId, data, locale)
    if (result.success) {
      toast.success(t("nameSuccessToast"))
      reset({ name: data.name })
      await router.refresh()
    } else {
      const desc =
        result.error === "ORG_UPDATE_NAME_NOT_ADMIN" ? t("nameNotAdminToast") : result.error
      toast.error(t("nameErrorToast"), { description: desc })
    }
  }

  async function onLeave() {
    const ok = await confirm({
      title: t("leaveConfirmTitle", { name: initialDisplayName }),
      description: t("leaveConfirmDescription"),
      confirmText: t("leaveConfirmAction"),
      variant: "destructive",
    })
    if (!ok) return

    setDestructivePending("leave")
    const result = await leaveOrganization(organizationId, locale)
    setDestructivePending(null)

    if (result.success) {
      toast.success(t("leaveSuccessToast", { name: initialDisplayName }))
      await router.refresh()
      await router.push("/dashboard")
    } else {
      const desc =
        result.error === "ORG_LEAVE_SOLE_MEMBER" ? t("leaveDisabledSole") : result.error
      toast.error(t("leaveErrorToast"), { description: desc })
    }
  }

  async function onDelete() {
    const ok = await confirm({
      title: t("deleteConfirmTitle", { name: initialDisplayName }),
      description: t("deleteConfirmDescription"),
      confirmText: t("deleteConfirmAction"),
      variant: "destructive",
    })
    if (!ok) return

    setDestructivePending("delete")
    const result = await deleteWorkspace(organizationId, locale)
    setDestructivePending(null)

    if (result.success) {
      toast.success(t("deleteSuccessToast", { name: initialDisplayName }))
      await router.refresh()
      await router.push("/dashboard")
    } else {
      const desc =
        result.error === "ORG_DELETE_NOT_ADMIN" ? t("deleteNotAdminToast") : result.error
      toast.error(t("deleteErrorToast"), { description: desc })
    }
  }

  const busy = destructivePending !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-5xl space-y-10 pb-24"
    >
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 gap-2 rounded-full px-3" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            {t("backToSettings")}
          </Link>
        </Button>
        <h1 className="font-display text-4xl tracking-wide text-foreground">{t("pageTitle")}</h1>
      </div>

      <section className="rounded-3xl bg-card p-8 shadow-ambient">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("generalTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("generalDescription")}</p>

        <form onSubmit={handleSubmit(onSaveName)} className="mt-8 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("displayNameLabel")}
            </label>
            <Input
              {...register("name")}
              disabled={!isAdmin}
              aria-invalid={!!errors.name}
              className="rounded-2xl border-0 bg-secondary text-foreground ring-0 transition-all focus:bg-card focus:shadow-ambient focus:ring-2 focus:ring-primary/30 dark:bg-secondary/50 dark:focus:bg-background"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">{t("displayNameHint")}</p>
            {!isAdmin && <p className="text-xs font-medium text-muted-foreground">{t("adminOnlyName")}</p>}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!isAdmin || !isDirty || isSubmitting}
            className="w-fit gap-2 rounded-full border-0 transition-all duration-300 hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                {t("savingName")}
              </>
            ) : (
              t("saveName")
            )}
          </Button>
        </form>
      </section>

      <section className="rounded-3xl bg-card p-8 shadow-ambient">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-destructive">{t("dangerTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("dangerDescription")}</p>
        <p className="mt-4 text-xs text-muted-foreground">{t("activeOrgNote")}</p>

        <div className="mt-8 flex flex-col gap-6">
          <div
            className={cn(
              "rounded-2xl bg-secondary p-6 dark:bg-secondary/50",
              !canLeave && "opacity-95",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <LogOut className="size-4 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{t("leaveTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("leaveHint")}</p>
                {!canLeave && (
                  <p className="mt-2 text-xs font-medium text-(--badge-processing-fg)">
                    {t("leaveDisabledSole")}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!canLeave || busy}
              className="mt-4 w-full max-w-md rounded-full border-border/60 bg-background transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:text-primary dark:bg-background/80"
              onClick={() => void onLeave()}
            >
              {destructivePending === "leave" ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <>
                  <LogOut className="size-4" strokeWidth={1.5} />
                  {t("leaveAction")}
                </>
              )}
            </Button>
          </div>

          {isAdmin ? (
            <div className="rounded-2xl border border-destructive/15 bg-destructive/5 p-6 dark:bg-destructive/10">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 dark:bg-destructive/20">
                  <Trash2 className="size-4 text-destructive" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{t("deleteTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("deleteHint")}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                className="mt-4 w-full max-w-md rounded-full transition-all duration-300 hover:scale-[1.02]"
                onClick={() => void onDelete()}
              >
                {destructivePending === "delete" ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <>
                    <Trash2 className="size-4" strokeWidth={1.5} />
                    {t("deleteAction")}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("deleteAdminOnly")}</p>
          )}
        </div>
      </section>
    </motion.div>
  )
}
