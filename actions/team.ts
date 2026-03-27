"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import {
  inviteMemberSchema,
  type TeamActionResult,
  type TeamInvite,
  type TeamMember,
} from "@/lib/validations/team"

async function requireOrganizationAdmin(organizationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false as const, error: "Unauthorized" }

  const { data: callerMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .single()

  if (!callerMembership || callerMembership.role !== "admin") {
    return { ok: false as const, error: "Only admins can manage team invitations" }
  }

  return { ok: true as const, userId: user.id }
}

export async function inviteTeamMember(
  payload: unknown,
  organizationId: string,
): Promise<TeamActionResult> {
  try {
    const guard = await requireOrganizationAdmin(organizationId)
    if (!guard.ok) return { success: false, error: guard.error }

    const parsed = inviteMemberSchema.safeParse(payload)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return { success: false, error: first?.message ?? "Invalid input" }
    }

    const email = parsed.data.email.trim().toLowerCase()
    const admin = createAdminClient()

    const { data: existingMemberRows, error: existingMemberError } = await admin
      .from("organization_members")
      .select("id, user_profiles!inner(email)")
      .eq("organization_id", organizationId)
      .eq("user_profiles.email", email)
      .limit(1)

    if (existingMemberError) {
      console.error("inviteTeamMember existing member check:", existingMemberError)
      return { success: false, error: "Could not validate existing team membership" }
    }

    if ((existingMemberRows ?? []).length > 0) {
      return { success: false, error: "This user is already a member of the workspace" }
    }

    const { data: existingInvite, error: existingInviteError } = await admin
      .from("organization_invites")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle()

    if (existingInviteError) {
      console.error("inviteTeamMember pending invite check:", existingInviteError)
      return { success: false, error: "Could not validate existing pending invite" }
    }

    if (existingInvite) {
      return { success: false, error: "This user already has a pending invite" }
    }

    const { error: insertInviteError } = await admin.from("organization_invites").insert({
      organization_id: organizationId,
      email,
      role: parsed.data.role,
      invited_by: guard.userId,
      status: "pending",
    })

    if (insertInviteError) {
      console.error("inviteTeamMember insert organization_invites:", insertInviteError)
      return { success: false, error: "Could not create invite record" }
    }

    const headersList = await headers()
    const host = headersList.get("host") ?? "localhost:3000"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const redirectTo = `${protocol}://${host}/api/auth/callback?type=invite`

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        invited_organization_id: organizationId,
        invited_role: parsed.data.role,
      },
    })

    if (inviteError) {
      console.error("inviteTeamMember:", inviteError)
      await admin.from("organization_invites").delete().eq("organization_id", organizationId).eq("email", email)
      return { success: false, error: inviteError.message }
    }

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch {
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Full team roster for an org. Uses standard client to verify membership, then
 * service-role client to read all members (RLS-safe pattern).
 */
export async function getTeamMembers(organizationId: string): Promise<TeamActionResult<TeamMember[]>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: guard, error: guardError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (guardError) {
      console.error("getTeamMembers guard:", guardError)
      return { success: false, error: "Unauthorized" }
    }

    if (!guard) {
      return { success: false, error: "Unauthorized" }
    }

    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from("organization_members")
      .select(
        `
        id,
        role,
        created_at,
        user_id,
        user_profiles (
          full_name,
          email
        )
      `,
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("getTeamMembers admin fetch:", error)
      return { success: false, error: error.message }
    }

    const members: TeamMember[] = (data ?? []).map((row) => {
      const profile = row.user_profiles as { full_name: string | null; email: string } | null
      return {
        id: row.id,
        role: row.role,
        created_at: row.created_at,
        user_id: row.user_id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? "",
      }
    })

    return { success: true, data: members }
  } catch (e) {
    console.error("getTeamMembers:", e)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getPendingTeamInvites(
  organizationId: string,
): Promise<TeamActionResult<TeamInvite[]>> {
  try {
    const guard = await requireOrganizationAdmin(organizationId)
    if (!guard.ok) return { success: false, error: guard.error }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("organization_invites")
      .select("id, email, role, created_at, status")
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("getPendingTeamInvites:", error)
      return { success: false, error: "Could not load pending invitations" }
    }

    return {
      success: true,
      data: (data ?? []).map((row) => ({
        id: row.id as string,
        email: row.email as string,
        role: row.role as string,
        created_at: row.created_at as string,
        status: row.status as string,
      })),
    }
  } catch (e) {
    console.error("getPendingTeamInvites:", e)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function revokeTeamInvite(
  inviteId: string,
  organizationId: string,
): Promise<TeamActionResult> {
  try {
    const guard = await requireOrganizationAdmin(organizationId)
    if (!guard.ok) return { success: false, error: guard.error }

    const admin = createAdminClient()
    const { error } = await admin
      .from("organization_invites")
      .delete()
      .eq("id", inviteId)
      .eq("organization_id", organizationId)

    if (error) {
      console.error("revokeTeamInvite:", error)
      return { success: false, error: "Could not revoke invite" }
    }

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (e) {
    console.error("revokeTeamInvite:", e)
    return { success: false, error: "An unexpected error occurred" }
  }
}
