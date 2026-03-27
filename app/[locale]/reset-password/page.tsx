"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPassword, type ResetState } from "./actions"

const initialState: ResetState = {}

export default function ResetPasswordPage() {
  const params = useParams()
  const locale = (params.locale as string) ?? "en"
  const t = useTranslations("ResetPassword")
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link
            href={`/${locale}/login`}
            className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            {t("backToSignIn")}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("brand")}</p>
          <h1 className="mt-3 font-display text-4xl uppercase tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-ambient">
          {state.success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle size={40} strokeWidth={1} className="text-primary" />
              <p className="text-sm text-muted-foreground">{state.success}</p>
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm">
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
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
                  autoComplete="email"
                  required
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

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? t("sending") : t("sendResetLink")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
