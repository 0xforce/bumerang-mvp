import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const type = searchParams.get("type") // "invite" | "recovery" | null
  const next = searchParams.get("next") ?? "/dashboard"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  if (type === "invite") {
    {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const email = user?.email?.trim().toLowerCase()
      if (user?.id && email) {
        const admin = createAdminClient()
        const { data: invite } = await admin
          .from("organization_invites")
          .select("id, organization_id, role")
          .eq("email", email)
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()

        if (invite) {
          const { data: existingMembership } = await admin
            .from("organization_members")
            .select("id")
            .eq("organization_id", invite.organization_id as string)
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle()

          if (!existingMembership) {
            const { error: membershipError } = await admin.from("organization_members").insert({
              organization_id: invite.organization_id as string,
              user_id: user.id,
              role: (invite.role as string) || "viewer",
            })

            if (membershipError) {
              console.error("[auth/callback] organization_members insert error:", membershipError.message)
            } else {
              await admin
                .from("user_profiles")
                .update({ last_active_organization_id: invite.organization_id as string })
                .eq("id", user.id)
              await admin.from("organization_invites").delete().eq("id", invite.id as string)
            }
          } else {
            await admin.from("organization_invites").delete().eq("id", invite.id as string)
          }
        }
      }
    }
    return NextResponse.redirect(`${origin}/update-password?next=/dashboard`)
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/update-password`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
