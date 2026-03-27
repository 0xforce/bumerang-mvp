import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getOrganizationContext } from "@/queries/organization"
import { resolveActiveOrganizationId } from "@/queries/active-workspace"
import { AccountPageClient } from "./AccountPageClient"

export default async function AccountPage({
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

  const resolved = await resolveActiveOrganizationId(user.id)
  if (!resolved.activeOrganizationId) redirect(`/${locale}/onboarding`)

  const orgContext = await getOrganizationContext(user.id, resolved.activeOrganizationId)
  if (!orgContext) {
    throw new Error(
      "Workspace membership exists but organization context could not be loaded. Check RLS policies.",
    )
  }

  return (
    <AccountPageClient
      verificationStatus={orgContext.verificationStatus}
      organizationId={orgContext.organizationId}
    />
  )
}
