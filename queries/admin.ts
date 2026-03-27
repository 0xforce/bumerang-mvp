import { cache } from "react"
import { createClient } from "@/utils/supabase/server"

export const getComplianceProfiles = cache(async function getComplianceProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("kyc_profiles")
    .select(`
      *,
      organizations ( name )
    `)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("getComplianceProfiles error:", error)
    return []
  }
  return data
})

export type AdminUserMembership = {
  memberId: string
  organizationId: string
  organizationName: string
  role: string
  joinedAt: string
}

export type AdminUserAccessRow = {
  userId: string
  email: string
  memberships: AdminUserMembership[]
  firstJoinedAt: string
  systemRole: "super_admin" | "compliance" | "operations" | "support" | null
}

/**
 * One logical user per row: all `organization_members` rows grouped by `user_id`.
 */
export const getAdminUsersAggregated = cache(async function getAdminUsersAggregated(): Promise<
  AdminUserAccessRow[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      id,
      role,
      created_at,
      user_id,
      organization_id,
      user_profiles ( email ),
      organizations ( name )
    `)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("getAdminUsersAggregated error:", error)
    return []
  }

  const byUser = new Map<string, AdminUserAccessRow>()

  for (const row of data ?? []) {
    const uid = row.user_id as string
    const prof = row.user_profiles as { email: string | null } | null
    const rowEmail = prof?.email?.trim() ?? ""

    const org = row.organizations as { name: string | null } | null
    const membership: AdminUserMembership = {
      memberId: row.id as string,
      organizationId: row.organization_id as string,
      organizationName: org?.name?.trim() || "Unknown workspace",
      role: (row.role as string) || "viewer",
      joinedAt: row.created_at as string,
    }

    const existing = byUser.get(uid)
    if (!existing) {
      byUser.set(uid, {
        userId: uid,
        email: rowEmail || `user_${uid.slice(0, 8)}…`,
        memberships: [membership],
        firstJoinedAt: membership.joinedAt,
        systemRole: null,
      })
    } else {
      existing.memberships.push(membership)
      if (new Date(membership.joinedAt) < new Date(existing.firstJoinedAt)) {
        existing.firstJoinedAt = membership.joinedAt
      }
      if (rowEmail) {
        existing.email = rowEmail
      }
    }
  }

  const rows = Array.from(byUser.values()).map((u) => ({
    ...u,
    memberships: [...u.memberships].sort((a, b) =>
      a.organizationName.localeCompare(b.organizationName, undefined, { sensitivity: "base" }),
    ),
  }))

  const userIds = rows.map((r) => r.userId)
  if (userIds.length > 0) {
    const { data: roleRows, error: roleError } = await supabase
      .from("user_profiles")
      .select("id, system_role")
      .in("id", userIds)
    if (!roleError) {
      const roleById = new Map<string, AdminUserAccessRow["systemRole"]>()
      for (const row of roleRows ?? []) {
        const role = row.system_role
        roleById.set(
          row.id as string,
          role === "super_admin" || role === "compliance" || role === "operations" || role === "support"
            ? role
            : null,
        )
      }
      for (const r of rows) {
        r.systemRole = roleById.get(r.userId) ?? null
      }
    }
  }

  rows.sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: "base" }))
  return rows
})

export const getNotificationDeliveries = cache(async function getNotificationDeliveries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notification_deliveries")
    .select("*")
    .eq("status", "failed")
    .order("last_attempt_at", { ascending: false })

  if (error) {
    console.error("getNotificationDeliveries error:", error)
    return []
  }
  return data
})

export const getSystemEvents = cache(async function getSystemEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notification_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("getSystemEvents error:", error)
    return []
  }
  return data
})
