"use client"

import * as React from "react"
import { useTransition } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Loader2, ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react"

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { forceApproveKyc, forceRejectKyc } from "@/actions/admin"

export function ComplianceClient({ profiles }: { profiles: any[] }) {
  const t = useTranslations("AdminPortal.compliance")
  const [filter, setFilter] = React.useState<string>("ALL")
  const [selectedProfile, setSelectedProfile] = React.useState<any | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = React.useMemo(() => {
    if (filter === "ALL") return profiles
    return profiles.filter((p) => p.verification_status === filter)
  }, [profiles, filter])

  function handleApprove(orgId: string) {
    startTransition(async () => {
      const res = await forceApproveKyc(orgId)
      if (res.success) {
        toast.success(t("toasts.approveSuccess"))
        setSelectedProfile(null)
      } else {
        toast.error(res.error || t("toasts.approveError"))
      }
    })
  }

  function handleReject(orgId: string) {
    startTransition(async () => {
      const res = await forceRejectKyc(orgId)
      if (res.success) {
        toast.success(t("toasts.rejectSuccess"))
        setSelectedProfile(null)
      } else {
        toast.error(res.error || t("toasts.rejectError"))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {["ALL", "PENDING", "PROCESSING", "MANUAL_REVIEW", "ERROR", "APPROVED", "REJECTED"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilter(f)}
            className="rounded-full"
          >
            {t(`filters.${f}`)}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>{t("table.organization")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("table.lastUpdated")}</TableHead>
              <TableHead className="text-right">{t("table.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.organization_id} className="group transition-colors hover:bg-secondary/20">
                  <TableCell className="font-medium">
                    {p.organizations?.name || t("unknownOrganization")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.verification_status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(p.updated_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProfile(p)}
                      className="rounded-full"
                    >
                      {t("review")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedProfile} onOpenChange={(o) => !o && setSelectedProfile(null)}>
        <SheetContent className="w-full overflow-y-auto border-l-0 shadow-ambient sm:max-w-xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-2xl">
              {selectedProfile?.organizations?.name}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.description")}
            </SheetDescription>
          </SheetHeader>

          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("sheet.currentStatus")}</span>
                <StatusBadge status={selectedProfile.verification_status} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("sheet.rawPayload")}
                </h3>
                <pre className="rounded-xl bg-secondary/50 p-4 text-xs overflow-x-auto">
                  {selectedProfile.raw_payload
                    ? JSON.stringify(JSON.parse(selectedProfile.raw_payload), null, 2)
                    : t("sheet.noRawPayload")}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("sheet.rejectionReasons")}
                </h3>
                <pre className="rounded-xl bg-secondary/50 p-4 text-xs overflow-x-auto text-destructive">
                  {selectedProfile.rejection_reasons
                    ? JSON.stringify(selectedProfile.rejection_reasons, null, 2)
                    : t("sheet.none")}
                </pre>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
                <Button
                  onClick={() => handleApprove(selectedProfile.organization_id)}
                  disabled={isPending}
                  className="w-full gap-2 rounded-full"
                >
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  {t("forceApprove")}
                </Button>
                <Button
                  onClick={() => handleReject(selectedProfile.organization_id)}
                  disabled={isPending}
                  variant="destructive"
                  className="w-full gap-2 rounded-full"
                >
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
                  {t("forceReject")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("AdminPortal.compliance")
  if (status === "APPROVED") {
    return (
      <Badge className="border-0 bg-primary/10 text-primary shadow-none hover:bg-primary/20">
        {t("statuses.APPROVED")}
      </Badge>
    )
  }
  if (status === "REJECTED" || status === "ERROR") {
    return (
      <Badge variant="destructive" className="border-0 shadow-none">
        {t(`statuses.${status}`)}
      </Badge>
    )
  }
  if (status === "MANUAL_REVIEW") {
    return (
      <Badge className="border-0 bg-secondary text-secondary-foreground shadow-none hover:bg-secondary">
        {t("statuses.MANUAL_REVIEW")}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="border-0 shadow-none">
      {t(`statuses.${status}`)}
    </Badge>
  )
}
