"use client"

import * as React from "react"
import { useTransition } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { Copy, Loader2, Search, UserX } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { revokeMembership, updateSystemRole } from "@/actions/admin"
import type { AdminUserAccessRow, AdminUserMembership } from "@/queries/admin"
import { cn } from "@/lib/utils"
import type { SystemRole } from "@/lib/admin-access"

export function UsersClient({
  users,
  viewerRole,
  currentUserId,
}: {
  users: AdminUserAccessRow[]
  viewerRole: SystemRole
  currentUserId: string | null
}) {
  const t = useTranslations("AdminPortal.users")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = React.useState("")
  const [revokeTarget, setRevokeTarget] = React.useState<{
    membership: AdminUserMembership
    userEmail: string
  } | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.email.toLowerCase().includes(q))
  }, [users, query])

  function handleCopyEmail(email: string) {
    void navigator.clipboard.writeText(email)
    toast.success(t("copied"))
  }

  function handleRevoke() {
    if (!revokeTarget) return
    startTransition(async () => {
      const res = await revokeMembership(revokeTarget.membership.memberId)
      if (res.success) {
        toast.success(t("revokeSuccess"))
        setRevokeTarget(null)
        router.refresh()
      } else {
        toast.error(res.error || t("actionFailed"))
      }
    })
  }

  function handleRoleUpdate(targetUserId: string, nextRole: SystemRole) {
    startTransition(async () => {
      const res = await updateSystemRole(targetUserId, nextRole)
      if (res.success) {
        toast.success(t("roleUpdated"))
        router.refresh()
      } else {
        toast.error(res.error || t("actionFailed"))
      }
    })
  }

  function roleLabel(role: SystemRole) {
    if (!role) return t("roles.customer")
    return t(`roles.${role}`)
  }

  const emptyMessage =
    users.length === 0 ? t("emptyAll") : query.trim() ? t("emptyFilter") : t("emptyAll")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 rounded-2xl border-0 bg-secondary pl-11 pr-4 text-sm shadow-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground tabular-nums">
          {t("userCount", { count: filtered.length })}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[min(28%,320px)]">{t("colEmail")}</TableHead>
              <TableHead className="w-[220px]">{t("colInternalRole")}</TableHead>
              <TableHead>{t("colWorkspaces")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-36 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.userId} className="group align-top transition-colors hover:bg-secondary/15">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <span className="break-all font-mono text-sm font-medium text-foreground">
                        {u.email}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopyEmail(u.email)}
                            aria-label={t("copyEmail")}
                          >
                            <Copy size={14} strokeWidth={1.5} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="rounded-lg text-xs">
                          {t("copyEmail")}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    {viewerRole === "super_admin" ? (
                      <Select
                        value={u.systemRole ?? "customer"}
                        onValueChange={(v) =>
                          handleRoleUpdate(u.userId, v === "customer" ? null : (v as SystemRole))
                        }
                        disabled={isPending || (currentUserId === u.userId && u.systemRole === "super_admin")}
                      >
                        <SelectTrigger size="sm" className="w-[180px] rounded-2xl">
                          <SelectValue placeholder={t("selectRole")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-ambient">
                          <SelectItem value="customer">{t("roles.customer")}</SelectItem>
                          <SelectItem value="support">{t("roles.support")}</SelectItem>
                          <SelectItem value="operations">{t("roles.operations")}</SelectItem>
                          <SelectItem value="compliance">{t("roles.compliance")}</SelectItem>
                          <SelectItem value="super_admin">{t("roles.super_admin")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="rounded-full border-0 capitalize">
                        {roleLabel(u.systemRole)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-3">
                      {u.memberships.map((m) => (
                        <div
                          key={m.memberId}
                          className={cn(
                            "flex flex-col gap-3 rounded-2xl bg-secondary p-4",
                            "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                          )}
                        >
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="truncate font-medium text-foreground">{m.organizationName}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="rounded-full border-0 capitalize shadow-none"
                              >
                                {m.role}
                              </Badge>
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {t("joined", { date: format(new Date(m.joinedAt), "MMM d, yyyy") })}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="shrink-0 gap-2 rounded-full border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setRevokeTarget({ membership: m, userEmail: u.email })
                            }
                            disabled={isPending}
                            aria-label={t("revokeAria", { organization: m.organizationName })}
                          >
                            <UserX size={14} strokeWidth={1.5} />
                            {t("revoke")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent className="rounded-3xl p-8 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-destructive">
              {t("revokeTitle")}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              {t("revokeDescription", {
                email: revokeTarget?.userEmail ?? "",
                organization: revokeTarget?.membership.organizationName ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3 sm:justify-between">
            <Button
              variant="secondary"
              onClick={() => setRevokeTarget(null)}
              disabled={isPending}
              className="w-full rounded-full sm:w-auto"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={isPending}
              className="w-full gap-2 rounded-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("revoking")}
                </>
              ) : (
                t("revoke")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
