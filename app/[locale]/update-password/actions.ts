"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export type UpdatePasswordState = {
  error?: string
}

export async function updatePassword(
  locale: string,
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  if (password !== confirm) {
    return { error: "Passwords do not match." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect(`/${locale}/dashboard`)
}
