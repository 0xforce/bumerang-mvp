import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

/**
 * Creates a Supabase client scoped to the proxy (middleware).
 * Collects any updated session cookies to be applied to the final response.
 */
export function createClient(
  request: NextRequest,
  onCookieSet: (name: string, value: string, options: Record<string, unknown>) => void,
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => onCookieSet(name, value, options))
        },
      },
    },
  )
}
