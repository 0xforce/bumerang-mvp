"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { BUMERANG_ORG_COOKIE, getWorkspaceCookieOptions } from "@/lib/workspace-cookie"
import {
  workspaceFormSchema,
  type WorkspaceFormValues,
  updateWorkspaceNamePayloadSchema,
} from "@/lib/validations/workspace"

export type WorkspacePayload = WorkspaceFormValues

export type WorkspaceActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string }

export type CreateWorkspaceResult =
  | { success: true; organizationId: string }
  | { success: false; error: string }

// ─── Shared: cookie + profile (server-only) ───────────────────────────────────

async function applyActiveWorkspaceState(userId: string, organizationId: string) {
  const supabase = await createClient()
  const { error: upErr } = await supabase
    .from("user_profiles")
    .update({ last_active_organization_id: organizationId })
    .eq("id", userId)

  if (upErr) {
    console.error("last_active_organization_id update:", upErr)
  }

  const cookieStore = await cookies()
  cookieStore.set(BUMERANG_ORG_COOKIE, organizationId, getWorkspaceCookieOptions())
}

// ─── createWorkspace ───────────────────────────────────────────────────────────

export async function createWorkspace(
  payload: unknown,
  locale: string,
): Promise<CreateWorkspaceResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    const parsed = workspaceFormSchema.safeParse(payload)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid data."
      return { success: false, error: message }
    }

    const { name, entity_type } = parsed.data

    const { data: existing, error: existingError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (existingError) {
      console.error("Membership fetch error:", existingError)
    }

    if (existing) {
      return { success: false, error: "You already have a workspace." }
    }

    const { data: orgId, error: rpcError } = await supabase.rpc("create_new_workspace", {
      workspace_name: name,
      workspace_entity_type: entity_type,
      target_user_id: user.id,
    })

    if (rpcError || !orgId) {
      console.error("create_new_workspace RPC error:", rpcError)
      return { success: false, error: "Failed to create workspace. Please try again." }
    }

    const id = orgId as string
    await applyActiveWorkspaceState(user.id, id)

    revalidatePath("/", "layout")
    const prefix = `/${locale}`
    revalidatePath(`${prefix}/dashboard`, "layout")
    revalidatePath(`${prefix}/onboarding`)

    return { success: true, organizationId: id }
  } catch (error) {
    console.error("createWorkspace error:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

/** Same as createWorkspace but allows users who already belong to an organization (multi-workspace). */
export async function createAdditionalWorkspace(
  payload: unknown,
  locale: string,
): Promise<CreateWorkspaceResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    const parsed = workspaceFormSchema.safeParse(payload)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid data."
      return { success: false, error: message }
    }

    const { name, entity_type } = parsed.data

    const { data: orgId, error: rpcError } = await supabase.rpc("create_new_workspace", {
      workspace_name: name,
      workspace_entity_type: entity_type,
      target_user_id: user.id,
    })

    if (rpcError || !orgId) {
      console.error("create_new_workspace RPC error (additional):", rpcError)
      return { success: false, error: "Failed to create workspace. Please try again." }
    }

    const id = orgId as string
    await applyActiveWorkspaceState(user.id, id)

    revalidatePath("/", "layout")
    const prefix = `/${locale}`
    revalidatePath(`${prefix}/dashboard`, "layout")
    revalidatePath(`${prefix}/onboarding`)

    return { success: true, organizationId: id }
  } catch (error) {
    console.error("createAdditionalWorkspace error:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

// ─── setActiveWorkspace ───────────────────────────────────────────────────────

export async function setActiveWorkspace(organizationId: string): Promise<WorkspaceActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: member, error: memErr } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (memErr || !member) {
      return { success: false, error: "You are not a member of this workspace." }
    }

    await applyActiveWorkspaceState(user.id, organizationId)

    revalidatePath("/", "layout")
    return { success: true }
  } catch (e) {
    console.error("setActiveWorkspace:", e)
    return { success: false, error: "Could not switch workspace." }
  }
}

// ─── deleteWorkspace ───────────────────────────────────────────────────────────

export async function deleteWorkspace(
  organizationId: string,
  locale?: string,
): Promise<WorkspaceActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: member, error: memErr } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (memErr || !member || member.role !== "admin") {
      return { success: false, error: "ORG_DELETE_NOT_ADMIN" }
    }

    const admin = createAdminClient()
    const { error: delErr } = await admin.from("organizations").delete().eq("id", organizationId)

    if (delErr) {
      console.error("deleteWorkspace:", delErr)
      return { success: false, error: delErr.message }
    }

    const cookieStore = await cookies()
    const activeCookie = cookieStore.get(BUMERANG_ORG_COOKIE)?.value
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("last_active_organization_id")
      .eq("id", user.id)
      .maybeSingle()

    const { data: remainingRows } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    const nextOrgId = remainingRows?.[0]?.organization_id
    const staleCookie = activeCookie === organizationId
    const staleProfile = profile?.last_active_organization_id === organizationId

    if (staleCookie || staleProfile) {
      if (nextOrgId) {
        await applyActiveWorkspaceState(user.id, nextOrgId)
      } else {
        if (staleCookie) cookieStore.delete(BUMERANG_ORG_COOKIE)
        if (staleProfile) {
          await supabase
            .from("user_profiles")
            .update({ last_active_organization_id: null })
            .eq("id", user.id)
            .eq("last_active_organization_id", organizationId)
        }
      }
    }

    revalidatePath("/", "layout")
    if (locale) {
      revalidatePath(`/${locale}/dashboard/settings/workspace`, "page")
    }
    return { success: true }
  } catch (e) {
    console.error("deleteWorkspace:", e)
    return { success: false, error: "Could not delete workspace." }
  }
}

// ─── updateWorkspaceName ───────────────────────────────────────────────────────

export async function updateWorkspaceName(
  organizationId: string,
  payload: unknown,
  locale: string,
): Promise<WorkspaceActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = updateWorkspaceNamePayloadSchema.safeParse(
      typeof payload === "object" && payload !== null ? payload : {},
    )
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid name."
      return { success: false, error: message }
    }

    const { data: member, error: memErr } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (memErr || !member || member.role !== "admin") {
      return { success: false, error: "ORG_UPDATE_NAME_NOT_ADMIN" }
    }

    const admin = createAdminClient()
    const { error: upErr } = await admin
      .from("organizations")
      .update({ name: parsed.data.name })
      .eq("id", organizationId)

    if (upErr) {
      console.error("updateWorkspaceName:", upErr)
      return { success: false, error: upErr.message }
    }

    revalidatePath("/", "layout")
    const prefix = `/${locale}`
    revalidatePath(`${prefix}/dashboard`, "layout")
    revalidatePath(`${prefix}/dashboard/settings`, "layout")
    revalidatePath(`${prefix}/dashboard/settings/workspace`, "page")
    return { success: true }
  } catch (e) {
    console.error("updateWorkspaceName:", e)
    return { success: false, error: "Could not update workspace name." }
  }
}

// ─── leaveOrganization ─────────────────────────────────────────────────────────

export async function leaveOrganization(
  organizationId: string,
  locale?: string,
): Promise<WorkspaceActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: member, error: memErr } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (memErr || !member) {
      return { success: false, error: "You are not a member of this organization." }
    }

    const admin = createAdminClient()
    const { count, error: countErr } = await admin
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)

    if (countErr) {
      console.error("leaveOrganization count:", countErr)
      return { success: false, error: "Could not verify team size." }
    }

    if ((count ?? 0) <= 1) {
      return { success: false, error: "ORG_LEAVE_SOLE_MEMBER" }
    }

    const { error: delMemErr } = await supabase
      .from("organization_members")
      .delete()
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)

    if (delMemErr) {
      console.error("leaveOrganization:", delMemErr)
      return { success: false, error: delMemErr.message }
    }

    const cookieStore = await cookies()
    const activeCookie = cookieStore.get(BUMERANG_ORG_COOKIE)?.value
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("last_active_organization_id")
      .eq("id", user.id)
      .maybeSingle()

    const wasActive =
      activeCookie === organizationId || profile?.last_active_organization_id === organizationId

    const { data: remainingRows } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    const nextOrgId = remainingRows?.[0]?.organization_id

    if (wasActive && nextOrgId) {
      await applyActiveWorkspaceState(user.id, nextOrgId)
    } else if (wasActive && !nextOrgId) {
      cookieStore.delete(BUMERANG_ORG_COOKIE)
      await supabase.from("user_profiles").update({ last_active_organization_id: null }).eq("id", user.id)
    }

    revalidatePath("/", "layout")
    if (locale) {
      revalidatePath(`/${locale}/dashboard/settings/workspace`, "page")
    }
    return { success: true }
  } catch (e) {
    console.error("leaveOrganization:", e)
    return { success: false, error: "Could not leave organization." }
  }
}
