"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

function stripLocalePrefix(path: string) {
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
}

export function AdminDashboardSwitcher() {
  const pathname = usePathname()
  const t = useTranslations("Nav")
  const bare = stripLocalePrefix(pathname)
  const onAdmin = bare === "/admin" || bare.startsWith("/admin/")

  return (
    <div
      className="flex shrink-0 items-center rounded-full bg-[#F8F9FA] p-1 dark:bg-[#1a1a1a]"
      role="navigation"
      aria-label={t("shellSwitcherAria")}
    >
      <Link
        href="/dashboard"
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300",
          !onAdmin
            ? "bg-white text-[#0A0A0A] shadow-ambient dark:bg-card dark:text-foreground"
            : "text-[#64748B] hover:text-[#0A0A0A] dark:hover:text-foreground",
        )}
      >
        {t("dashboard")}
      </Link>
      <Link
        href="/admin"
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300",
          onAdmin
            ? "bg-white text-[#0A0A0A] shadow-ambient dark:bg-card dark:text-foreground"
            : "text-[#64748B] hover:text-[#F94212] dark:hover:text-[#F94212]",
        )}
      >
        {t("adminShell")}
      </Link>
    </div>
  )
}
