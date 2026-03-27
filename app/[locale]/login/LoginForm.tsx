"use client"

import { useActionState, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { LogIn, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { signInWithPassword, type AuthState } from "./actions"

const initialState: AuthState = {}

function LoginFormInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params.locale as string) ?? "en"
  const t = useTranslations("Login")

  const urlError = searchParams.get("error") || searchParams.get("error_description")

  const boundAction = signInWithPassword.bind(null, locale)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Beta Access Error Banner */}
      {urlError && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-foreground">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={16} strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="font-medium">{t("errorBannerTitle")}</p>
            <p className="text-muted-foreground">{t("closedBetaNotice")}</p>
          </div>
        </div>
      )}

      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-3"
        onClick={handleGoogleSignIn}
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t("googleSignIn")}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Email/Password form */}
      <form action={formAction} className="flex flex-col gap-3">
        <Input
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
          disabled={isPending}
        />
        <div className="flex flex-col gap-1">
          <Input
            name="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            required
            disabled={isPending}
          />
          <div className="flex justify-end">
            <Link
              href={`/${locale}/reset-password`}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        {state.error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={14} strokeWidth={1.5} className="text-destructive" />
            {state.error}
          </div>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full gap-2" disabled={isPending}>
          <LogIn size={16} strokeWidth={1.5} />
          {isPending ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <LoginFormInner />
    </Suspense>
  )
}
