"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import {
  counterpartySchema,
  type Counterparty,
  type CounterpartyActionResult,
} from "@/lib/validations/counterparties"

async function verifyOrgMembership(userId: string, organizationId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single()
  return data
}

export async function addCounterparty(
  payload: unknown,
  organizationId: string,
): Promise<CounterpartyActionResult<Counterparty>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: "Unauthorized" }

    const member = await verifyOrgMembership(user.id, organizationId)
    if (!member) return { success: false, error: "You do not belong to this organization" }

    const parsed = counterpartySchema.safeParse(payload)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return { success: false, error: first?.message ?? "Invalid input" }
    }

    const { data, error } = await supabase
      .from("counterparties")
      .insert({
        ...parsed.data,
        organization_id: organizationId,
        type: "business",
        verification_status: "UNVERIFIED",
        kira_counterparty_id: `local_${crypto.randomUUID()}`,
        email: parsed.data.email || null,
        business_registration_number: parsed.data.business_registration_number || null,
        business_website: parsed.data.business_website || null,
        swift_code: parsed.data.swift_code || null,
        phone_number: parsed.data.phone_number || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath("/dashboard/counterparties")
    return { success: true, data }
  } catch {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getCounterparties(
  organizationId: string,
): Promise<CounterpartyActionResult<Counterparty[]>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: "Unauthorized" }

    const { data, error } = await supabase
      .from("counterparties")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteCounterparty(
  counterpartyId: string,
  organizationId: string,
): Promise<CounterpartyActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: "Unauthorized" }

    const member = await verifyOrgMembership(user.id, organizationId)
    if (!member) return { success: false, error: "You do not belong to this organization" }

    const { error } = await supabase
      .from("counterparties")
      .delete()
      .eq("id", counterpartyId)
      .eq("organization_id", organizationId)

    if (error) return { success: false, error: error.message }

    revalidatePath("/dashboard/counterparties")
    return { success: true }
  } catch {
    return { success: false, error: "An unexpected error occurred" }
  }
}
