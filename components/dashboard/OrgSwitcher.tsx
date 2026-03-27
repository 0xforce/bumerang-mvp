"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { motion } from "framer-motion"
import { Check, ChevronsUpDown, Loader2, Plus, Rocket, Search, Settings2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { setActiveWorkspace, createAdditionalWorkspace } from "@/actions/workspace"
import { workspaceFormSchema, type WorkspaceFormValues } from "@/lib/validations/workspace"
import type { OrgSwitcherWorkspaceRow } from "@/queries/active-workspace"
import type { VerificationStatus } from "@/lib/verification-status"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type OrgSwitcherWorkspace = OrgSwitcherWorkspaceRow

export function OrgSwitcher({
  workspaces,
  activeOrganizationId,
}: {
  workspaces: OrgSwitcherWorkspace[]
  activeOrganizationId: string
}) {
  const t = useTranslations("OrgSwitcher")
  const tRoles = useTranslations("Settings.teamDirectory.roles")
  const [isPending, startTransition] = React.useTransition()
  const [search, setSearch] = React.useState("")
  const [newWorkspaceOpen, setNewWorkspaceOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const locale = useLocale()
  const router = useRouter()

  const filteredWorkspaces = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return workspaces
    return workspaces.filter((w) => w.name.toLowerCase().includes(q))
  }, [workspaces, search])

  const active = workspaces.find((w) => w.id === activeOrganizationId) ?? workspaces[0]
  const label = active?.name ?? "—"
  const initial = label.slice(0, 1).toUpperCase()

  function roleLabel(role: string) {
    const key = role as "admin" | "preparer" | "viewer"
    if (key === "admin" || key === "preparer" || key === "viewer") {
      return tRoles(key)
    }
    return role
  }

  function verificationLabel(status: VerificationStatus) {
    const labels: Record<VerificationStatus, string> = {
      UNVERIFIED: t("verification.UNVERIFIED"),
      PENDING: t("verification.PENDING"),
      PROCESSING: t("verification.PROCESSING"),
      SHUFTI_APPROVED: t("verification.SHUFTI_APPROVED"),
      APPROVED: t("verification.APPROVED"),
      REJECTED: t("verification.REJECTED"),
    }
    return labels[status] ?? status
  }

  function onSelect(id: string) {
    if (id === activeOrganizationId) return
    startTransition(async () => {
      const result = await setActiveWorkspace(id)
      if (result.success) {
        await router.refresh()
      } else {
        toast.error(result.error ?? "Could not switch workspace")
      }
    })
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={(o) => { setMenuOpen(o); if (!o) setSearch("") }}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isPending}
            className="flex max-w-[220px] items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-70"
          >
            {isPending ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-semibold text-primary">
                {initial}
              </div>
            )}
            <span className="truncate">{label}</span>
            <ChevronsUpDown size={14} strokeWidth={1.5} className="ml-1 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 rounded-xl border-border/40 bg-popover p-2 shadow-ambient"
          onKeyDown={(e) => {
            if (e.target instanceof HTMLInputElement) e.stopPropagation()
          }}
        >
          <div className="mb-2 flex items-center gap-1.5">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full rounded-md bg-accent/50 py-1.5 pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-accent"
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-full text-muted-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:text-[#F94212]"
                  aria-label={t("settingsTooltip")}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMenuOpen(false)
                    router.push("/dashboard/settings/workspace")
                  }}
                >
                  <Settings2 size={16} strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="rounded-lg text-xs">
                {t("settingsTooltip")}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="max-h-[min(50vh,280px)] overflow-y-auto">
            {filteredWorkspaces.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">{t("noResults")}</p>
            ) : (
              filteredWorkspaces.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2.5",
                    w.id === activeOrganizationId && "bg-accent/50",
                  )}
                  onSelect={() => onSelect(w.id)}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                    {w.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">{w.name}</span>
                      {w.id === activeOrganizationId && (
                        <Check size={14} strokeWidth={1.5} className="shrink-0 text-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {roleLabel(w.role)}
                      <span className="text-muted-foreground/60"> · </span>
                      {verificationLabel(w.verificationStatus)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
          <DropdownMenuSeparator className="my-1 bg-border/50" />
          <p className="rounded-lg px-2 py-2 text-muted-foreground text-sm">{t("allOrgs")}</p>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-muted-foreground"
            onSelect={() => setNewWorkspaceOpen(true)}
          >
            <Plus size={14} strokeWidth={1.5} />
            {t("newOrg")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewWorkspaceDialog
        open={newWorkspaceOpen}
        onOpenChange={setNewWorkspaceOpen}
        locale={locale}
        onSuccess={async () => {
          await router.refresh()
        }}
        title={t("modalTitle")}
        description={t("modalDescription")}
      />
    </>
  )
}

function NewWorkspaceDialog({
  open,
  onOpenChange,
  locale,
  onSuccess,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
  onSuccess: () => Promise<void>
  title: string
  description: string
}) {
  const tWs = useTranslations("WorkspaceSetup")
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: "",
      entity_type: "individual",
    },
  })

  React.useEffect(() => {
    if (!open) {
      const id = setTimeout(() => reset(), 200)
      return () => clearTimeout(id)
    }
  }, [open, reset])

  async function onSubmit(data: WorkspaceFormValues) {
    const result = await createAdditionalWorkspace(data, locale)
    if (result.success) {
      toast.success(tWs("successToast"))
      onOpenChange(false)
      await onSuccess()
    } else {
      toast.error(tWs("errorToast"), { description: result.error })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-md border-0 bg-card p-0 shadow-ambient sm:rounded-3xl"
      >
        <DialogHeader className="border-b border-border/40 px-8 py-6 text-left">
          <DialogTitle className="font-display text-xl tracking-wide text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {tWs("entityType")}
            </p>
            <Controller
              name="entity_type"
              control={control}
              render={({ field }) => (
                <div className="relative flex w-full rounded-full bg-[#F8F9FA] p-1 dark:bg-secondary/50">
                  {(["individual", "business"] as const).map((type) => {
                    const isActive = field.value === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => field.onChange(type)}
                        className={cn(
                          "relative z-10 w-1/2 rounded-full py-2.5 text-sm font-medium capitalize tracking-wide transition-colors",
                          isActive ? "text-[#0A0A0A] dark:text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="entity-type-org-switcher-modal"
                            className="absolute inset-0 -z-10 rounded-full bg-white shadow-ambient dark:bg-background"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        {tWs(type)}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {tWs("name")}
            </label>
            <Input
              {...register("name")}
              placeholder={tWs("namePlaceholder")}
              aria-invalid={!!errors.name}
              className="rounded-2xl border-0 bg-[#F8F9FA] ring-0 transition-all focus:bg-white focus:shadow-ambient focus:ring-2 focus:ring-[#F94212]/30 dark:bg-secondary/50 dark:focus:bg-background"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{tWs("errors.tooShort")}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full gap-2 rounded-full border-0 transition-all duration-300 hover:scale-[1.02]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                {tWs("creating")}
              </>
            ) : (
              <>
                <Rocket size={16} strokeWidth={1.5} />
                {tWs("cta")}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
