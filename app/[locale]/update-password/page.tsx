"use client"

import { useActionState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { KeyRound, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updatePassword, type UpdatePasswordState } from "./actions"

const initialState: UpdatePasswordState = {}

export default function UpdatePasswordPage() {
  const params = useParams()
  const locale = (params.locale as string) ?? "en"
  const t = useTranslations("UpdatePassword")

  const boundAction = updatePassword.bind(null, locale)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("brand")}</p>
          <h1 className="mt-3 font-display text-4xl uppercase tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-ambient">
          <form action={formAction} className="flex flex-col gap-4">
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
                strokeWidth={1.5}
              />
              <Input
                name="password"
                type="password"
                placeholder={t("newPasswordPlaceholder")}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
                strokeWidth={1.5}
              />
              <Input
                name="confirm"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                className="pl-10"
              />
            </div>

            {state.error && (
              <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={14} strokeWidth={1.5} />
                {state.error}
              </div>
            )}

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={isPending}>
              {isPending ? t("saving") : t("setPasswordAndContinue")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
