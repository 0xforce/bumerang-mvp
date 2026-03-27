"use client"

import * as React from "react"
import { useTransition } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Loader2, RefreshCw, Activity, AlertTriangle } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { retryNotificationDelivery } from "@/actions/admin"

export function SystemClient({ deliveries, events }: { deliveries: any[]; events: any[] }) {
  const t = useTranslations("AdminPortal.system")
  const [isPending, startTransition] = useTransition()
  const [retryingId, setRetryingId] = React.useState<string | null>(null)

  function handleRetry(id: string) {
    setRetryingId(id)
    startTransition(async () => {
      const res = await retryNotificationDelivery(id)
      if (res.success) {
        toast.success(t("toasts.retrySuccess"))
      } else {
        toast.error(res.error || t("toasts.retryError"))
      }
      setRetryingId(null)
    })
  }

  return (
    <Tabs defaultValue="failures" className="w-full">
      <TabsList className="mb-6 bg-secondary/50 rounded-full p-1">
        <TabsTrigger value="failures" className="rounded-full px-6 gap-2">
          <AlertTriangle size={16} />
          {t("tabs.failures")}
          {deliveries.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">
              {deliveries.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="events" className="rounded-full px-6 gap-2">
          <Activity size={16} />
          {t("tabs.events")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="failures" className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>{t("failures.table.channel")}</TableHead>
                <TableHead>{t("failures.table.destination")}</TableHead>
                <TableHead>{t("failures.table.error")}</TableHead>
                <TableHead>{t("failures.table.lastAttempt")}</TableHead>
                <TableHead className="text-right">{t("failures.table.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {t("failures.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((d) => (
                  <TableRow key={d.id} className="group transition-colors hover:bg-secondary/20">
                    <TableCell>
                      <Badge variant="secondary" className="shadow-none border-0 uppercase tracking-widest text-[10px]">
                        {d.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{d.destination}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-destructive text-sm">
                      {d.error || t("failures.unknownError")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.last_attempt_at
                        ? format(new Date(d.last_attempt_at), "MMM d, HH:mm")
                        : t("failures.never")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRetry(d.id)}
                        disabled={isPending && retryingId === d.id}
                        className="rounded-full gap-2"
                      >
                        {isPending && retryingId === d.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        {t("failures.retry")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="events" className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>{t("events.table.eventType")}</TableHead>
                <TableHead>{t("events.table.organizationId")}</TableHead>
                <TableHead>{t("events.table.createdAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    {t("events.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                events.map((e) => (
                  <TableRow key={e.id} className="group transition-colors hover:bg-secondary/20">
                    <TableCell>
                      <Badge variant="secondary" className="shadow-none border-0 font-mono text-xs">
                        {e.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {e.organization_id || t("events.system")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(e.created_at), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}
