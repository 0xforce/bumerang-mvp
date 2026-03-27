"use server"

import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"

export type ResetState = {
  error?: string
  success?: string
}

export async function resetPassword(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = (formData.get("email") as string)?.trim()

  if (!email) {
    return { error: "Email is required." }
  }

  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const redirectTo = `${protocol}://${host}/api/auth/callback?type=recovery`

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) {
    return { error: error.message }
  }

  // Always respond with success to prevent email enumeration
  return { success: "If that email is registered, you'll receive a reset link shortly." }
}
