"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Bell,
  Sparkles,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
} from "lucide-react"
import { Link, useRouter } from "@/i18n/routing"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { OrgSwitcher, type OrgSwitcherWorkspace } from "@/components/dashboard/OrgSwitcher"
import { AdminDashboardSwitcher } from "./AdminDashboardSwitcher"
import { getAdminNavItems } from "@/components/admin/AdminSidebar"
import { NAV_ITEMS, SECONDARY_ITEMS } from "./Sidebar"
import type { SystemRole } from "@/lib/admin-access"

// Maps raw path segments to display labels
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  account: "Account",
  counterparties: "Counterparties",
  transactions: "Transactions",
  settings: "Settings",
}

function useLocalelesPathname() {
  const raw = usePathname()
  // Strip leading locale prefix /en/ or /es/
  return raw.replace(/^\/[a-z]{2}(\/|$)/, "/")
}

function buildCrumbs(segments: string[]) {
  return segments.map((seg, idx) => {
    // We prepend /dashboard to the hrefs because we sliced it off
    const href = "/dashboard/" + segments.slice(0, idx + 1).join("/")
    const label =
      SEGMENT_LABELS[seg] ??
      seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    const isLast = idx === segments.length - 1
    return { href, label, isLast }
  })
}

type TopbarProps = {
  user: { email: string | null; full_name: string | null; avatar_url?: string | null }
  hasUnreadNotifications?: boolean
  workspaces: OrgSwitcherWorkspace[]
  activeOrganizationId: string
  /** User dashboard vs internal admin shell */
  variant?: "dashboard" | "admin"
  /** When on user dashboard: show Admin pill only for internal users */
  isPlatformAdmin?: boolean
  adminRole?: SystemRole
}

export function Topbar({
  user,
  hasUnreadNotifications = false,
  workspaces,
  activeOrganizationId,
  variant = "dashboard",
  isPlatformAdmin = false,
  adminRole = null,
}: TopbarProps) {
  const showOrgSwitcher = variant === "dashboard"
  const showShellSwitcher = variant === "admin" || isPlatformAdmin
  const mobilePrimaryNav = variant === "admin" ? getAdminNavItems(adminRole) : NAV_ITEMS
  const shellHomeHref = variant === "admin" ? "/admin" : "/dashboard"
  const t = useTranslations("Nav")
  const tTheme = useTranslations("Theme")
  const pathname = useLocalelesPathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Breadcrumb logic:
  // If we are exactly on a base tab (e.g. /dashboard or /dashboard/transactions),
  // we don't show the tab name in the topbar.
  // If we are deeper (e.g. /dashboard/transactions/txn-123), we show "Transactions / TXN-123"
  const segments = pathname.split("/").filter(Boolean)
  const isBaseTab =
    segments.length <= 1 || (segments.length === 2 && segments[0] === "dashboard")
  const crumbs = isBaseTab ? [] : buildCrumbs(segments.slice(1))

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40",
        "bg-card/80 px-4 lg:px-6 backdrop-blur-md",
      )}
    >
      {/* ── Left: Mobile Hamburger & Logo | Desktop Org Switcher + Breadcrumbs ────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-accent hover:text-foreground">
                <Menu size={20} strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col border-r-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                {variant === "admin" ? "Admin navigation for Bumerang" : "Main navigation for Bumerang"}
              </SheetDescription>

              <div className="flex h-16 shrink-0 items-center px-6">
                <SheetClose asChild>
                  <Link href={shellHomeHref as "/"} className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange">
                      <span className="font-display text-sm leading-none text-white">B</span>
                    </div>
                    <span className="font-display text-xl uppercase tracking-widest text-foreground">
                      Bumerang
                    </span>
                  </Link>
                </SheetClose>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {showOrgSwitcher && (
                  <div className="mb-6">
                    <OrgSwitcher
                      workspaces={workspaces}
                      activeOrganizationId={activeOrganizationId}
                    />
                  </div>
                )}
                {showShellSwitcher && (
                  <div className={cn("mb-6", showOrgSwitcher && "mt-2")}>
                    <AdminDashboardSwitcher />
                  </div>
                )}

                <nav className="flex flex-col gap-1">
                  <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                    {variant === "admin" ? t("adminMenu") : "Main"}
                  </p>
                  {mobilePrimaryNav.map((item) => {
                    const isActive =
                      item.href === "/dashboard" || item.href === "/admin"
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                      <SheetClose asChild key={item.key}>
                        <Link
                          href={item.href as "/"}
                          className={cn(
                            "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-accent text-foreground shadow-ambient"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-orange" />
                          )}
                          <Icon
                            size={18}
                            strokeWidth={1.5}
                            className={cn(
                              "shrink-0 transition-colors duration-200",
                              isActive ? "text-orange" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          {t(item.key)}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </nav>

                {variant !== "admin" && (
                  <nav className="mt-8 flex flex-col gap-1">
                    <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                      More
                    </p>
                    {SECONDARY_ITEMS.map((item) => {
                      const isActive = pathname.startsWith(item.href)
                      const Icon = item.icon
                      return (
                        <SheetClose asChild key={item.key}>
                          <Link
                            href={item.href as "/"}
                            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className={cn(
                              "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-accent text-foreground shadow-ambient"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-orange" />
                            )}
                            <Icon
                              size={18}
                              strokeWidth={1.5}
                              className={cn(
                                "shrink-0 transition-colors duration-200",
                                isActive ? "text-orange" : "text-muted-foreground group-hover:text-foreground",
                              )}
                            />
                            {t(item.key)}
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </nav>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <Link
            href={shellHomeHref as "/"}
            className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange"
          >
            <span className="font-display text-sm leading-none text-white">B</span>
          </Link>
        </div>

        {/* Desktop Left Side */}
        <div className="hidden lg:flex items-center gap-2">
          {showOrgSwitcher && (
            <OrgSwitcher
              workspaces={workspaces}
              activeOrganizationId={activeOrganizationId}
            />
          )}
          {showShellSwitcher && <AdminDashboardSwitcher />}

          {crumbs.length > 0 && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <Breadcrumb>
                <BreadcrumbList className="flex-nowrap">
                  {crumbs.map((crumb, i) => (
                    <React.Fragment key={crumb.href}>
                      {i > 0 && (
                        <BreadcrumbSeparator className="text-muted-foreground/40 [&>svg]:size-3" />
                      )}
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage className="text-sm font-semibold text-foreground">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link
                              href={crumb.href as "/"}
                              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </>
          )}
        </div>
      </div>

      {/* ── Right: Actions ───────────────────────────── */}
      <div className="flex items-center gap-1 lg:gap-1.5">
        {/* Theme Toggle - Hidden on very small screens */}
        <div className="hidden sm:block">
          {mounted && (
            <ActionTooltip label={tTheme("toggle")}>
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-ambient"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={18} strokeWidth={1.5} />
                ) : (
                  <Moon size={18} strokeWidth={1.5} />
                )}
              </button>
            </ActionTooltip>
          )}
        </div>

        {/* AI Assistant - Desktop Only */}
        <div className="hidden lg:block">
          <ActionTooltip label={t("aiAssistant")}>
            <AIAssistantButton />
          </ActionTooltip>
        </div>

        {/* Notifications */}
        <ActionTooltip label={t("notifications")}>
          <NotificationBell hasUnread={hasUnreadNotifications} />
        </ActionTooltip>

        <div className="hidden lg:block mx-1 h-4 w-px bg-border/50" />

        {/* User Profile */}
        <UserProfile user={user} />
      </div>
    </header>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function UserProfile({ user }: { user: TopbarProps["user"] }) {
  const tUser = useTranslations("User")
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login" as "/")
    router.refresh()
  }

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/50">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border border-border/40 bg-popover p-1.5 shadow-xl"
      >
        <div className="px-2 py-2.5">
          <p className="truncate text-sm font-medium text-foreground">
            {user.full_name ?? user.email ?? "—"}
          </p>
          {user.full_name && (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/account"
            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm focus:bg-accent"
          >
            <User size={14} strokeWidth={1.5} />
            {tUser("viewProfile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-red-500 focus:bg-red-500/10 focus:text-red-500"
        >
          <LogOut size={14} strokeWidth={1.5} />
          {tUser("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationBell({ hasUnread }: { hasUnread: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex size-9 cursor-pointer items-center justify-center rounded-full",
        "text-muted-foreground transition-all duration-200",
        "hover:bg-accent hover:text-foreground hover:shadow-ambient",
      )}
    >
      <Bell size={18} strokeWidth={1.5} />

      {hasUnread && (
        <span className="absolute right-2 top-2 flex size-2 items-center justify-center">
          {/* Ping animation */}
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-orange" />
        </span>
      )}
    </button>
  )
}

function AIAssistantButton() {
  return (
    <button
      type="button"
      className={cn(
        "relative flex size-9 cursor-pointer items-center justify-center rounded-full",
        "text-orange transition-all duration-200",
        "hover:bg-accent hover:shadow-ambient",
      )}
    >
      <Sparkles size={18} strokeWidth={1.5} />
    </button>
  )
}

/**
 * Radix `TooltipTrigger asChild` must merge ref onto a single DOM node. Custom components
 * often break that; a native `span` wrapper always receives the ref so hover works.
 */
function ActionTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0 items-center justify-center leading-none">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={3}
        className="rounded-lg border-0 bg-foreground px-3 py-1.5 text-xs text-background shadow-md"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
