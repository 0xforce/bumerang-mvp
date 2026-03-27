import createIntlMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // Collect session cookies that Supabase wants to set/refresh.
  // We'll forward them onto whatever response we ultimately return.
  const pendingCookies: Array<{
    name: string
    value: string
    options: Record<string, unknown>
  }> = []

  const supabase = createClient(request, (name, value, options) => {
    pendingCookies.push({ name, value, options })
  })

  // IMPORTANT: use getUser(), never getSession() — getSession() is unauthenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Extract locale from path prefix (e.g. /en/dashboard → "en")
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
  const locale = localeMatch?.[1] ?? routing.defaultLocale

  // Protect /[locale]/dashboard and /[locale]/admin
  const isProtected = /^\/[a-z]{2}\/(dashboard|admin)(\/|$)/.test(pathname)

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    const redirectRes = NextResponse.redirect(url)
    pendingCookies.forEach(({ name, value, options }) =>
      redirectRes.cookies.set(name, value, options as Parameters<typeof redirectRes.cookies.set>[2]),
    )
    return redirectRes
  }

  // Let next-intl handle locale routing
  const intlRes = intlMiddleware(request)

  // Forward any refreshed session cookies onto the intl response
  pendingCookies.forEach(({ name, value, options }) =>
    intlRes.cookies.set(name, value, options as Parameters<typeof intlRes.cookies.set>[2]),
  )

  return intlRes
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)" ],
}
