import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Topbar } from "@/components/layout/Topbar"
import { getInternalUserRole } from "@/lib/admin-access"

export default async function AdminLayout({
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
  const systemRole = await getInternalUserRole(user.id)
  if (!systemRole) {
    redirect(`/${locale}/dashboard`)
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const sidebarUser = {
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <AdminSidebar systemRole={systemRole} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-secondary/30">
          <Topbar
            user={sidebarUser}
            hasUnreadNotifications={false}
            workspaces={[]}
            activeOrganizationId=""
            variant="admin"
            adminRole={systemRole}
          />

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
