import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      console.error("Membership fetch error on index page:", membershipError)
    }

    if (membership?.organization_id) {
      redirect(`/${locale}/dashboard`)
    }
    redirect(`/${locale}/onboarding`)
  }

  const t = await getTranslations("Index")

  return (
    <main className="flex min-h-svh items-center justify-center bg-surface p-12">
      <div className="flex flex-col items-start gap-6 rounded-3xl bg-white p-12 shadow-ambient">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate">
          Bumerang Platform
        </p>
        <h1 className="font-display text-5xl uppercase tracking-tight text-ink">
          {t("title")}
        </h1>
        <Button size="lg">{t("cta")}</Button>
      </div>
    </main>
  )
}
