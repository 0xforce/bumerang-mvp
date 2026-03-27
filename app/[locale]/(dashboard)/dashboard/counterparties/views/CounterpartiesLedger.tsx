"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/hooks/use-confirm"
import { deleteCounterparty } from "@/actions/counterparties"
import type { Recipient } from "@/lib/validations/counterparties"

interface CounterpartiesLedgerProps {
  data: Recipient[]
  organizationId: string
}

export function CounterpartiesLedger({ data, organizationId }: CounterpartiesLedgerProps) {
  const t = useTranslations("Counterparties")
  const confirm = useConfirm()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleDelete = async (recipient: Recipient) => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.description", { name: recipient.name }),
      confirmText: t("actions.delete"),
      variant: "destructive",
    })
    if (!confirmed) return

    setDeletingId(recipient.id)
    const result = await deleteCounterparty(recipient.id, organizationId)
    setDeletingId(null)

    if (result.success) {
      toast.success(t("deleteConfirm.successToast", { name: recipient.name }))
    } else {
      toast.error(t("deleteConfirm.errorToast"), { description: result.error })
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-card p-4 shadow-ambient md:p-8">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/40 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <th className="pb-4 pl-6 font-medium">{t("table.name")}</th>
              <th className="pb-4 font-medium">{t("table.type")}</th>
              <th className="pb-4 font-medium">{t("table.country")}</th>
              <th className="pb-4 font-medium">{t("table.details")}</th>
              <th className="pb-4 pr-6 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {data.map((cp) => (
              <tr
                key={cp.id}
                className={cn(
                  "group transition-colors hover:bg-secondary/50",
                  deletingId === cp.id && "opacity-50",
                )}
              >
                <td className="py-5 pl-6">
                  <span className="font-medium text-foreground">{cp.name}</span>
                </td>
                <td className="py-5 text-muted-foreground">
                  <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium capitalize">
                    {cp.type}
                  </span>
                </td>
                <td className="py-5 text-muted-foreground">
                  {cp.jurisdiction ?? t("table.dash")}
                </td>
                <td className="py-5 font-mono text-muted-foreground tabular-nums">
                  {cp.bank_name && cp.account_number
                    ? `${cp.bank_name} ${t("table.accountMask", { last4: cp.account_number.slice(-4) })}`
                    : t("table.dash")}
                </td>
                <td className="py-5 pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={deletingId === cp.id}
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[160px] rounded-2xl shadow-ambient border-0"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer rounded-2xl py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onSelect={() => handleDelete(cp)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t("actions.delete")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
