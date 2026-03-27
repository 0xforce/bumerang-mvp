"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { getInternalUserRole, hasRequiredRole, type SystemRole } from "@/lib/admin-access"

async function getCallerContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { userId: null, role: null as SystemRole }
  const role = await getInternalUserRole(user.id)
  return { userId: user.id, role }
}

async function verifyRole(allowedRoles: SystemRole[]) {
  const ctx = await getCallerContext()
  if (!ctx.userId) return { ok: false as const, error: "Unauthorized" }
  if (!hasRequiredRole(ctx.role, allowedRoles)) {
    return { ok: false as const, error: "Forbidden" }
  }
  return { ok: true as const, userId: ctx.userId, role: ctx.role }
}

export async function forceApproveKyc(organizationId: string) {
  const guard = await verifyRole(["super_admin", "compliance", "operations"])
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("kyc_profiles")
    .update({ verification_status: "APPROVED" })
    .eq("organization_id", organizationId)

  if (error) {
    console.error("forceApproveKyc error:", error)
    return { success: false, error: "Failed to approve KYC" }
  }

  revalidatePath("/admin/compliance")
  return { success: true }
}

export async function forceRejectKyc(organizationId: string) {
  const guard = await verifyRole(["super_admin", "compliance", "operations"])
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("kyc_profiles")
    .update({ verification_status: "REJECTED" })
    .eq("organization_id", organizationId)

  if (error) {
    console.error("forceRejectKyc error:", error)
    return { success: false, error: "Failed to reject KYC" }
  }

  revalidatePath("/admin/compliance")
  return { success: true }
}

export async function revokeUserAccess(organizationId: string, userId: string) {
  const guard = await verifyRole(["super_admin", "operations"])
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId)

  if (error) {
    console.error("revokeUserAccess error:", error)
    return { success: false, error: "Failed to revoke access" }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

/** Preferred: delete by membership row id (single workspace removal). */
export async function revokeMembership(memberId: string) {
  const guard = await verifyRole(["super_admin", "operations"])
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase.from("organization_members").delete().eq("id", memberId)

  if (error) {
    console.error("revokeMembership error:", error)
    return { success: false, error: "Failed to revoke access" }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function retryNotificationDelivery(deliveryId: string) {
  const guard = await verifyRole(["super_admin", "operations"])
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("notification_deliveries")
    .update({ status: "pending", attempts: 0 })
    .eq("id", deliveryId)

  if (error) {
    console.error("retryNotificationDelivery error:", error)
    return { success: false, error: "Failed to retry delivery" }
  }

  revalidatePath("/admin/system")
  return { success: true }
}

export async function updateSystemRole(targetUserId: string, newRole: SystemRole) {
  const guard = await verifyRole(["super_admin"])
  if (!guard.ok) return { success: false, error: guard.error }

  if (guard.userId === targetUserId && newRole !== "super_admin") {
    return { success: false, error: "You cannot demote yourself from super admin" }
  }

  const validRole =
    newRole === null ||
    newRole === "super_admin" ||
    newRole === "compliance" ||
    newRole === "operations" ||
    newRole === "support"
  if (!validRole) return { success: false, error: "Invalid role" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({ system_role: newRole })
    .eq("id", targetUserId)

  if (error) {
    console.error("updateSystemRole error:", error)
    return { success: false, error: "Failed to update internal role" }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
