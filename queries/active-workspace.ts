import { cache } from "react"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getOrganizationContext, type OrganizationContext } from "@/queries/organization"
import type { VerificationStatus } from "@/queries/organization"
import { normalizeVerificationStatus } from "@/lib/verification-status"
import { BUMERANG_ORG_COOKIE } from "@/lib/workspace-cookie"

/**
 * Resolves which org is active for SSR: cookie → profile last_active → first membership.
 * Never trusts cookie/profile without membership verification.
 */
export const resolveActiveOrganizationId = cache(async function resolveActiveOrganizationId(
  userId: string,
): Promise<{
  activeOrganizationId: string
  membershipIds: string[]
  needsCookieHeal: boolean
}> {
  const cookieStore = await cookies()
  const cookieOrg = cookieStore.get(BUMERANG_ORG_COOKIE)?.value

  const supabase = await createClient()
  const { data: rows, error: memError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (memError) {
    console.error("Membership list error:", memError)
  }

  const membershipIds = (rows ?? []).map((r) => r.organization_id)

  if (membershipIds.length === 0) {
    return { activeOrganizationId: "", membershipIds: [], needsCookieHeal: false }
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("last_active_organization_id")
    .eq("id", userId)
    .maybeSingle()

  const profileOrg = profile?.last_active_organization_id ?? null

  const isMember = (id: string | null | undefined) =>
    id != null && id !== "" && membershipIds.includes(id)

  let active: string
  if (isMember(cookieOrg)) {
    active = cookieOrg!
  } else if (isMember(profileOrg)) {
    active = profileOrg!
  } else {
    active = membershipIds[0]!
  }

  const needsCookieHeal = cookieOrg !== active

  return { activeOrganizationId: active, membershipIds, needsCookieHeal }
})

/** Deduped per request — use in dashboard pages that need the active org context. */
export const getActiveOrganizationContext = cache(async function getActiveOrganizationContext(
  userId: string,
): Promise<OrganizationContext | null> {
  const { activeOrganizationId } = await resolveActiveOrganizationId(userId)
  if (!activeOrganizationId) return null
  return getOrganizationContext(userId, activeOrganizationId)
})

export type OrgSwitcherWorkspaceRow = {
  id: string
  name: string
  role: string
  memberCount: number
  verificationStatus: VerificationStatus
}

function aggregateMemberCountsFromRows(
  rows: { organization_id: string }[] | null,
  orgIds: string[],
): Map<string, number> {
  const memberCountByOrg = new Map<string, number>()
  for (const id of orgIds) memberCountByOrg.set(id, 0)
  for (const row of rows ?? []) {
    const oid = row.organization_id
    memberCountByOrg.set(oid, (memberCountByOrg.get(oid) ?? 0) + 1)
  }
  return memberCountByOrg
}

/**
 * Accurate member counts per org (bypasses RLS). Call only after the caller has established
 * the set of `organization_id`s the user is allowed to know about.
 */
async function fetchMemberCountsByOrgIdsAdmin(orgIds: string[]): Promise<Map<string, number>> {
  if (orgIds.length === 0) return new Map()

  const admin = createAdminClient()
  const { data: countRows, error: countErr } = await admin
    .from("organization_members")
    .select("organization_id")
    .in("organization_id", orgIds)

  if (countErr) {
    console.error("fetchMemberCountsByOrgIdsAdmin:", countErr)
    const fallback = new Map<string, number>()
    for (const id of orgIds) fallback.set(id, 1)
    return fallback
  }

  return aggregateMemberCountsFromRows(countRows, orgIds)
}

/** Member count for a single org via service role (server-only). */
export const getMemberCountForOrganizationAdmin = cache(async function getMemberCountForOrganizationAdmin(
  organizationId: string,
): Promise<number> {
  const admin = createAdminClient()
  const { count, error } = await admin
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)

  if (error) {
    console.error("getMemberCountForOrganizationAdmin:", error)
    return 1
  }
  return count ?? 1
})

export const listUserOrganizationsForSwitcher = cache(async function listUserOrganizationsForSwitcher(
  userId: string,
): Promise<OrgSwitcherWorkspaceRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error || !data?.length) {
    if (error) console.error("listUserOrganizationsForSwitcher:", error)
    return []
  }

  const orgIds = [...new Set(data.map((r) => r.organization_id))]

  const [memberCountByOrg, kycResult] = await Promise.all([
    fetchMemberCountsByOrgIdsAdmin(orgIds),
    supabase.from("kyc_profiles").select("organization_id, verification_status").in("organization_id", orgIds),
  ])

  const verificationByOrg = new Map<string, VerificationStatus>()
  for (const row of kycResult.data ?? []) {
    verificationByOrg.set(
      row.organization_id,
      normalizeVerificationStatus(row.verification_status),
    )
  }

  return data.map((row) => {
    const org = row.organizations as { id: string; name: string } | null
    return {
      id: row.organization_id,
      name: org?.name ?? "Workspace",
      role: row.role,
      memberCount: memberCountByOrg.get(row.organization_id) ?? 0,
      verificationStatus: verificationByOrg.get(row.organization_id) ?? "UNVERIFIED",
    }
  })
})
