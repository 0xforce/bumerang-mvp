import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

/** Auth only — workspace gate lives on `page.tsx` (membership) to match dashboard layout. */
export default async function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  return <>{children}</>
}
