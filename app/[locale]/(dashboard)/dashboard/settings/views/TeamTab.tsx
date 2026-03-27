"use client"

import * as React from "react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Info, Plus, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  inviteMemberSchema,
  type InviteMemberPayload,
  type TeamInvite,
} from "@/lib/validations/team"
import { inviteTeamMember, revokeTeamInvite } from "@/actions/team"

interface TeamTabProps {
  organizationId: string
  currentUserRole: string
  pendingInvites: TeamInvite[]
}

export function TeamTab({ organizationId, currentUserRole, pendingInvites }: TeamTabProps) {
  const t = useTranslations("Settings.team")
  const isAdmin = currentUserRole === "admin"
  const [isRevoking, startRevoking] = React.useTransition()
  const router = useRouter()

  function handleRevoke(inviteId: string) {
    startRevoking(async () => {
      const result = await revokeTeamInvite(inviteId, organizationId)
      if (result.success) {
        toast.success(t("pending.toasts.revokeSuccess"))
        router.refresh()
      } else {
        toast.error(t("pending.toasts.revokeError"), { description: result.error })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Roles Explanation UI */}
      <div className="flex flex-col gap-4 rounded-4xl bg-secondary/30 p-6 sm:flex-row sm:items-start md:p-8">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Info size={20} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">{t("rolesInfo.title")}</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{t("rolesInfo.admin")}</li>
            <li>{t("rolesInfo.preparer")}</li>
          </ul>
        </div>
      </div>

      {/* Invite — roster lives in server-rendered TeamDirectory below */}
      <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-ambient sm:flex-row sm:items-center sm:justify-between md:p-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("title")}
        </h3>
        {isAdmin && (
          <InviteTeamModal organizationId={organizationId}>
            <Button className="gap-2 rounded-full">
              <Plus size={16} strokeWidth={1.5} />
              {t("inviteBtn")}
            </Button>
          </InviteTeamModal>
        )}
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-ambient md:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("pending.title")}
          </h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            {t("pending.count", { count: pendingInvites.length })}
          </p>
        </div>

        {pendingInvites.length === 0 ? (
          <p className="rounded-2xl bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("pending.empty")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-background/60">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("pending.table.email")}</TableHead>
                  <TableHead>{t("pending.table.role")}</TableHead>
                  <TableHead>{t("pending.table.dateInvited")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("pending.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id} className="hover:bg-secondary/20">
                    <TableCell className="font-mono text-sm">{invite.email}</TableCell>
                    <TableCell className="capitalize">{invite.role}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {format(new Date(invite.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!isAdmin || isRevoking}
                        onClick={() => handleRevoke(invite.id)}
                        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                        {t("pending.revoke")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

function InviteTeamModal({
  children,
  organizationId,
}: {
  children: React.ReactNode
  organizationId: string
}) {
  const router = useRouter()
  const t = useTranslations("Settings.team.modal")
  const [isOpen, setIsOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberPayload>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "preparer" },
  })

  const role = watch("role")

  React.useEffect(() => {
    if (!isOpen) setTimeout(reset, 300)
  }, [isOpen, reset])

  const onSubmit = async (data: InviteMemberPayload) => {
    const result = await inviteTeamMember(data, organizationId)
    if (result.success) {
      toast.success(t("successToast"), { description: t("successToastDesc") })
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(t("errorToast"), { description: result.error })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="overflow-hidden border-0 bg-card p-0 shadow-ambient sm:max-w-md sm:rounded-3xl">
        <DialogHeader className="border-b border-border/40 px-8 py-6">
          <DialogTitle className="font-display text-2xl tracking-wide text-foreground">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-8 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("email")}
              </label>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="rounded-xl"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("role")}
              </label>
              <div className="relative flex w-full rounded-full bg-secondary/50 p-1">
                {(["admin", "preparer"] as const).map((r) => {
                  const isActive = role === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setValue("role", r, { shouldValidate: true })}
                      className={cn(
                        "relative z-10 flex-1 rounded-full py-2.5 text-sm font-medium capitalize tracking-wide transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="role-toggle"
                          className="absolute inset-0 -z-10 rounded-full bg-card"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      {t(`roles.${r}`)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 bg-card px-8 py-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full py-6 text-sm font-bold uppercase tracking-widest"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("sendInvite")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
