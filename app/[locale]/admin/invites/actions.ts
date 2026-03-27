"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { headers } from "next/headers"
import { getInternalUserRole, hasRequiredRole } from "@/lib/admin-access"

export type InviteState = {
  error?: string
  success?: string
}

export type PendingPlatformInvite = {
  userId: string
  email: string
  createdAt: string
}

async function requirePlatformAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, error: "Unauthorized." }
  }

  const role = await getInternalUserRole(user.id)
  if (!hasRequiredRole(role, ["super_admin", "operations"])) {
    return { ok: false as const, error: "Unauthorized." }
  }

  return { ok: true as const }
}

export async function sendInvite(
  _prevState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()

  if (!email) {
    return { error: "Email is required." }
  }

  const guard = await requirePlatformAdmin()
  if (!guard.ok) return { error: guard.error }

  // Construct redirect URL from request origin
  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const redirectTo = `${protocol}://${host}/api/auth/callback?type=invite`

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/invites")
  return { success: `Invite sent to ${email}` }
}

export async function getPendingPlatformInvites(): Promise<PendingPlatformInvite[]> {
  const guard = await requirePlatformAdmin()
  if (!guard.ok) return []

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })

  if (error) {
    console.error("getPendingPlatformInvites:", error)
    return []
  }

  return (data.users ?? [])
    .filter((u) => !u.last_sign_in_at && !!u.email)
    .map((u) => ({
      userId: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function revokeSystemInvite(userId: string): Promise<{ success: boolean; error?: string }> {
  const guard = await requirePlatformAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) {
    console.error("revokeSystemInvite:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/invites")
  return { success: true }
}
