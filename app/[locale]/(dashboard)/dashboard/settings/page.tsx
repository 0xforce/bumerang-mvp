import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/utils/supabase/server"
import { getActiveOrganizationContext } from "@/queries/active-workspace"
import { TeamDirectory } from "@/components/settings/TeamDirectory"
import { getPendingTeamInvites } from "@/actions/team"
import { SettingsPageClient } from "./SettingsPageClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Settings" })
  return {
    title: t("title"),
    description: t("pageDescription"),
  }
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const orgContext = await getActiveOrganizationContext(user.id)
  if (!orgContext) redirect(`/${locale}/onboarding`)

  const profileResult = await supabase
    .from("user_profiles")
    .select("full_name, email, phone_number")
    .eq("id", user.id)
    .single()

  const pendingInvitesResult = await getPendingTeamInvites(orgContext.organizationId)

  return (
    <SettingsPageClient
      profileData={{
        fullName: profileResult.data?.full_name ?? null,
        email: profileResult.data?.email ?? user.email ?? "",
        phone: profileResult.data?.phone_number ?? null,
        organizationName: orgContext.organizationName,
      }}
      teamData={{
        organizationId: orgContext.organizationId,
        currentUserRole: orgContext.role,
        pendingInvites: pendingInvitesResult.success ? (pendingInvitesResult.data ?? []) : [],
      }}
      teamDirectory={<TeamDirectory organizationId={orgContext.organizationId} />}
    />
  )
}
