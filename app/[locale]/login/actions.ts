"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export type AuthState = {
  error?: string
}

export async function signInWithPassword(
  locale: string,
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Invalid email or password." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Could not resolve authenticated user." }
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    console.error("Membership fetch error after login:", membershipError)
    return { error: "Could not resolve organization membership. Please try again." }
  }

  if (membership?.organization_id) {
    redirect(`/${locale}/dashboard`)
  }

  redirect(`/${locale}/onboarding`)
}
