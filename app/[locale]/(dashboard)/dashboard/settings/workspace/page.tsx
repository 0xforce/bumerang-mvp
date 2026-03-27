import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/utils/supabase/server"
import {
  getActiveOrganizationContext,
  getMemberCountForOrganizationAdmin,
} from "@/queries/active-workspace"
import { WorkspaceSettingsClient } from "./WorkspaceSettingsClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Settings.workspace" })
  return {
    title: t("pageTitle"),
    description: t("pageSubtitle"),
  }
}

export default async function WorkspaceSettingsPage({
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

  const memberCount = await getMemberCountForOrganizationAdmin(orgContext.organizationId)

  return (
    <WorkspaceSettingsClient
      organizationId={orgContext.organizationId}
      initialDisplayName={orgContext.organizationName}
      memberCount={memberCount}
      currentUserRole={orgContext.role}
    />
  )
}
