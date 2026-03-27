"use client"

import { Activity, BookOpen, Mail, ShieldCheck, Users } from "lucide-react"
import { Sidebar, type NavItem } from "@/components/layout/Sidebar"
import type { SystemRole } from "@/lib/admin-access"

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { key: "adminCompliance", href: "/admin/compliance", icon: ShieldCheck },
  { key: "adminLedger", href: "/admin/ledger", icon: BookOpen },
  { key: "adminUsers", href: "/admin/users", icon: Users },
  { key: "adminSystem", href: "/admin/system", icon: Activity },
  { key: "adminInvites", href: "/admin/invites", icon: Mail },
]

export function getAdminNavItems(systemRole: SystemRole): NavItem[] {
  if (systemRole === "compliance") {
    return ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin/system")
  }
  return ADMIN_NAV_ITEMS
}

export function AdminSidebar({ systemRole }: { systemRole: SystemRole }) {
  return (
    <Sidebar
      activeOrganizationId="admin"
      activeOrganizationName="Admin Portal"
      verificationStatus="APPROVED"
      navItems={getAdminNavItems(systemRole)}
      secondaryItems={[]}
    />
  )
}
