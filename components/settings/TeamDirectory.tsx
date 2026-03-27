import { getTranslations } from "next-intl/server"
import { getTeamMembers } from "@/actions/team"
import { cn } from "@/lib/utils"

function initialsFromName(fullName: string | null, email: string): string {
  const n = (fullName ?? "").trim()
  if (n.length >= 2) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (
        parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
      ).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

type TeamDirectoryProps = {
  organizationId: string
}

export async function TeamDirectory({ organizationId }: TeamDirectoryProps) {
  const t = await getTranslations("Settings.teamDirectory")
  const result = await getTeamMembers(organizationId)

  if (!result.success) {
    return (
      <div
        className={cn(
          "rounded-3xl bg-white p-8 shadow-ambient",
          "dark:bg-card",
        )}
      >
        <p className="text-sm text-[#64748B]">{t("loadError")}</p>
      </div>
    )
  }

  const members = result.data ?? []

  if (members.length === 0) {
    return (
      <div
        className={cn(
          "rounded-3xl bg-white p-10 text-center shadow-ambient",
          "dark:bg-card",
        )}
      >
        <p className="text-sm text-[#64748B]">{t("empty")}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl bg-white p-6 shadow-ambient md:p-8",
        "dark:bg-card",
      )}
    >
      <h3 className="mb-8 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
        {t("title")}
      </h3>

      <ul className="flex flex-col gap-4">
        {members.map((member) => {
          const displayName = member.full_name?.trim() || member.email || "—"
          const initials = initialsFromName(member.full_name, member.email)
          const roleLabel =
            {
              admin: t("roles.admin"),
              preparer: t("roles.preparer"),
              viewer: t("roles.viewer"),
            }[member.role] ?? member.role

          return (
            <li
              key={member.id}
              className="flex flex-col gap-4 rounded-2xl bg-[#F8F9FA] p-4 transition-colors hover:bg-[#F1F3F5] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5 dark:bg-secondary/40 dark:hover:bg-secondary/60"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0A0A0A] shadow-ambient dark:bg-background dark:text-foreground"
                  aria-hidden
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#0A0A0A] dark:text-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-[#64748B]">{member.email}</p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex w-fit shrink-0 items-center rounded-full px-4 py-1.5 text-xs font-medium",
                  "bg-white text-[#0A0A0A] shadow-ambient dark:bg-background dark:text-foreground",
                )}
              >
                {roleLabel}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
