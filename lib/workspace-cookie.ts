export const BUMERANG_ORG_COOKIE = "bumerang_organization_id"

export function getWorkspaceCookieOptions() {
  return {
    path: "/" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  }
}
