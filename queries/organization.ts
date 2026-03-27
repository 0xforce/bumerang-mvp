import { cache } from "react"
import { createClient } from "@/utils/supabase/server"
import {
  normalizeVerificationStatus,
  type VerificationStatus,
} from "@/lib/verification-status"

export type { VerificationStatus }

export interface OrganizationContext {
  organizationId: string
  organizationName: string
  entityType: string
  role: string
  verificationStatus: VerificationStatus
}

/**
 * Fetches organization context for a user. Pass `organizationId` to scope to the active workspace
 * (required when the user belongs to multiple orgs).
 */
export const getOrganizationContext = cache(async function getOrganizationContext(
  userId: string,
  organizationId?: string,
): Promise<OrganizationContext | null> {
  const supabase = await createClient()

  let memberQuery = supabase
    .from("organization_members")
    .select("role, organization_id")
    .eq("user_id", userId)

  if (organizationId) {
    memberQuery = memberQuery.eq("organization_id", organizationId)
  }

  const { data: member, error: memberError } = await memberQuery.limit(1).maybeSingle()

  if (memberError) {
    console.error("Membership fetch error:", memberError)
    return null
  }
  if (!member) return null

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, entity_type")
    .eq("id", member.organization_id)
    .maybeSingle()

  if (orgError || !org) return null

  const { data: kyc } = await supabase
    .from("kyc_profiles")
    .select("verification_status")
    .eq("organization_id", member.organization_id)
    .maybeSingle()

  return {
    organizationId: member.organization_id,
    organizationName: org.name,
    entityType: org.entity_type,
    role: member.role,
    verificationStatus: normalizeVerificationStatus(kyc?.verification_status),
  }
})
