"use client"

import { useActionState, useTransition } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { AlertCircle, CheckCircle, Mail, Send, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import {
  sendInvite,
  revokeSystemInvite,
  type InviteState,
  type PendingPlatformInvite,
} from "./actions"

const initialState: InviteState = {}

export function InvitesClient({ pendingInvites }: { pendingInvites: PendingPlatformInvite[] }) {
  const t = useTranslations("AdminPortal.invites")
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(sendInvite, initialState)
  const [isRevoking, startRevoke] = useTransition()

  function handleRevoke(userId: string) {
    startRevoke(async () => {
      const result = await revokeSystemInvite(userId)
      if (result.success) {
        toast.success(t("toasts.revokeSuccess"))
        router.refresh()
      } else {
        toast.error(t("toasts.revokeError"), { description: result.error })
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl tracking-wide text-foreground">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="max-w-md rounded-3xl bg-card p-8 shadow-ambient">
        <form action={formAction} className="flex flex-col gap-4">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              strokeWidth={1.5}
            />
            <Input
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              className="pl-10"
              required
              disabled={isPending}
            />
          </div>

          <Button type="submit" size="lg" disabled={isPending} className="w-full gap-2 rounded-full">
            <Send size={16} strokeWidth={1.5} />
            {isPending ? t("sending") : t("sendInvite")}
          </Button>
        </form>

        {state.success && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">
            <CheckCircle size={16} strokeWidth={1.5} />
            {state.success}
          </div>
        )}
        {state.error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={16} strokeWidth={1.5} />
            {state.error}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-ambient md:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("pendingTitle")}
          </h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {t("pendingCount", { count: pendingInvites.length })}
          </p>
        </div>

        {pendingInvites.length === 0 ? (
          <p className="rounded-2xl bg-secondary/40 px-4 py-10 text-center text-sm text-muted-foreground">
            {t("emptyPending")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-background/60">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("table.email")}</TableHead>
                  <TableHead>{t("table.createdAt")}</TableHead>
                  <TableHead className="w-[220px] text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.userId}>
                    <TableCell className="font-mono text-sm">{invite.email}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {format(new Date(invite.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isRevoking}
                        onClick={() => handleRevoke(invite.userId)}
                        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                        {t("revokePlatformAccess")}
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
