"use client"

import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/hooks/use-confirm"

export function TestUtilitiesButton() {
  const t = useTranslations("DevTools")
  const confirm = useConfirm()

  async function handleTest() {
    const confirmed = await confirm({
      title: t("confirmTitle"),
      description: t("confirmDescription"),
      variant: "energy",
    })

    if (confirmed) {
      toast.success(t("successToast"), {
        description: t("successToastDescription"),
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleTest}
    >
      <FlaskConical size={14} strokeWidth={1.5} />
      {t("testUtilities")}
    </Button>
  )
}
