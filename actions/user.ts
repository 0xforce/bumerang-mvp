"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { updateProfileSchema, type UserActionResult } from "@/lib/validations/user"

export async function updateUserProfile(payload: unknown): Promise<UserActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: "Unauthorized" }

    const parsed = updateProfileSchema.safeParse(payload)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return { success: false, error: first?.message ?? "Invalid input" }
    }

    const { firstName, lastName, phone } = parsed.data
    const full_name = `${firstName.trim()} ${lastName.trim()}`.trim()

    const { error } = await supabase
      .from("user_profiles")
      .update({
        full_name,
        phone_number: phone ?? null,
      })
      .eq("id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch {
    return { success: false, error: "An unexpected error occurred" }
  }
}
