import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/utils/supabase/server"
import { OnboardingForm } from "./OnboardingForm"

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    console.error("Membership fetch error:", membershipError)
  }

  if (membership?.organization_id) {
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations("WorkspaceSetup")

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("brand")}
          </p>
          <h1 className="mt-3 font-display text-4xl uppercase tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-ambient">
          <OnboardingForm locale={locale} />
        </div>
      </div>
    </div>
  )
}
