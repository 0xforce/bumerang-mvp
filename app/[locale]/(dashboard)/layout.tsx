import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getOrganizationContext } from "@/queries/organization"
import {
  resolveActiveOrganizationId,
  listUserOrganizationsForSwitcher,
} from "@/queries/active-workspace"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { getInternalUserRole } from "@/lib/admin-access"
import { DashboardBanner } from "./dashboard/views/DashboardBanner"
import { WorkspaceCookieHeal } from "@/components/dashboard/WorkspaceCookieHeal"

export default async function DashboardLayout({
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

  if (!user) redirect(`/${locale}/login`)

  const resolved = await resolveActiveOrganizationId(user.id)

  if (!resolved.activeOrganizationId) {
    redirect(`/${locale}/onboarding`)
  }

  const activeOrganizationId = resolved.activeOrganizationId

  const [orgContext, profileResult, notifResult, workspaces] = await Promise.all([
    getOrganizationContext(user.id, activeOrganizationId),
    supabase.from("user_profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
    listUserOrganizationsForSwitcher(user.id),
  ])

  if (!orgContext) {
    throw new Error(
      "Workspace membership exists but organization context could not be loaded. Check RLS policies.",
    )
  }

  const sidebarUser = {
    email: user.email ?? null,
    full_name: profileResult.data?.full_name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  }

  const { verificationStatus } = orgContext
  const systemRole = await getInternalUserRole(user.id)
  const isPlatformAdmin = !!systemRole

  return (
    <TooltipProvider delayDuration={0}>
      <WorkspaceCookieHeal
        organizationId={activeOrganizationId}
        enabled={resolved.needsCookieHeal}
      />
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar
          verificationStatus={verificationStatus}
          activeOrganizationId={activeOrganizationId}
          activeOrganizationName={orgContext.organizationName}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-secondary/30">
          <Topbar
            user={sidebarUser}
            hasUnreadNotifications={(notifResult.count ?? 0) > 0}
            workspaces={workspaces}
            activeOrganizationId={activeOrganizationId}
            isPlatformAdmin={isPlatformAdmin}
            adminRole={systemRole}
          />

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <DashboardBanner verificationStatus={verificationStatus} />

            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
