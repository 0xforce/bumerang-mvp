import { createClient } from "@/utils/supabase/server"

export type SystemRole = "super_admin" | "compliance" | "operations" | "support" | null

export async function getInternalUserRole(userId: string): Promise<SystemRole> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .select("system_role")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("getInternalUserRole:", error)
    return null
  }

  const role = data?.system_role
  if (role === "super_admin" || role === "compliance" || role === "operations" || role === "support") {
    return role
  }
  return null
}

export function hasRequiredRole(userRole: SystemRole, allowedRoles: SystemRole[]): boolean {
  if (userRole === "super_admin") return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}
