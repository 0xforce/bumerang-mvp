"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { usePathname, useRouter, Link } from "@/i18n/routing"
import {
  LayoutDashboard,
  User,
  Users,
  ArrowLeftRight,
  Settings,
  BookOpen,
  Globe,
  PanelLeft,
  Check,
  ShieldAlert,
  Rocket,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/lib/verification-status"
import {
  isRejected,
  isVerificationApproved,
  isVerificationInFlight,
} from "@/lib/verification-status"

const EXPANDED_W = 280
const COLLAPSED_W = 72

type SidebarMode = "expanded" | "collapsed" | "hover"

export type NavItem = {
  key: string
  href: string
  icon: React.ElementType
}

export type SecondaryItem = {
  key: string
  href: string
  icon: React.ElementType
  external?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "account", href: "/dashboard/account", icon: User },
  { key: "counterparties", href: "/dashboard/counterparties", icon: Users },
  { key: "transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
]

export const SECONDARY_ITEMS: SecondaryItem[] = [
  { key: "settings", href: "/dashboard/settings", icon: Settings },
  { key: "education", href: "https://docs.bumerang.io", icon: BookOpen, external: true },
]

export function Sidebar({
  verificationStatus = "UNVERIFIED",
  activeOrganizationId,
  activeOrganizationName,
  navItems = NAV_ITEMS,
  secondaryItems = SECONDARY_ITEMS,
}: {
  verificationStatus?: VerificationStatus
  activeOrganizationId?: string
  activeOrganizationName?: string
  navItems?: NavItem[]
  secondaryItems?: SecondaryItem[]
}) {
  const t = useTranslations("Nav")
  const tLang = useTranslations("Language")
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const [mounted, setMounted] = React.useState(false)

  const [mode, setMode] = React.useState<SidebarMode>("hover")
  const [hovered, setHovered] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebar-mode") as SidebarMode | null
    if (stored) setMode(stored)
  }, [])

  function updateMode(m: SidebarMode) {
    setMode(m)
    localStorage.setItem("sidebar-mode", m)
  }

  const isExpanded = mode === "expanded" || (mode === "hover" && (hovered || dropdownOpen))

  function toggleLocale() {
    const next = locale === "en" ? "es" : "en"
    router.replace(pathname, { locale: next })
  }

  const SIDEBAR_MODES: { value: SidebarMode; label: string }[] = [
    { value: "expanded", label: t("sidebarExpanded") },
    { value: "collapsed", label: t("sidebarCollapsed") },
    { value: "hover", label: t("sidebarHover") },
  ]

  return (
    <motion.aside
      data-active-organization-id={activeOrganizationId}
      data-active-organization-name={activeOrganizationName}
      animate={{ width: isExpanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => mode === "hover" && setHovered(true)}
      onMouseLeave={() => mode === "hover" && setHovered(false)}
      className="relative hidden lg:flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/40 bg-card shadow-ambient"
      style={{ willChange: "width" }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div className={cn("flex h-16 shrink-0 items-center", isExpanded ? "px-5" : "justify-center")}>
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange">
            <span className="font-display text-sm leading-none text-white">B</span>
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                key="wordmark"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="whitespace-nowrap font-display text-xl uppercase tracking-widest text-foreground"
              >
                Bumerang
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── Primary nav ──────────────────────────────── */}
      <nav className={cn("flex flex-col gap-0.5", isExpanded ? "px-3" : "px-2")}>
        <SectionLabel label="Main" show={isExpanded} />
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href)
          return (
            <NavLink
              key={item.key}
              href={item.href}
              label={t(item.key) || item.key}
              icon={item.icon}
              isActive={isActive}
              isExpanded={isExpanded}
            />
          )
        })}
      </nav>

      {/* ── Secondary nav ────────────────────────────── */}
      <nav className={cn("mt-6 flex flex-col gap-0.5", isExpanded ? "px-3" : "px-2")}>
        <SectionLabel label="More" show={isExpanded} />
        {secondaryItems.map((item) => (
          <NavLink
            key={item.key}
            href={item.href}
            label={t(item.key) || item.key}
            icon={item.icon}
            isActive={pathname.startsWith(item.href)}
            isExpanded={isExpanded}
            external={item.external}
          />
        ))}
      </nav>

      <div className="mt-auto">
        <SidebarPromoCard isExpanded={isExpanded} verificationStatus={verificationStatus} />
      </div>

      {/* ── Utility controls ─────────────────────────── */}
      <div className={cn("shrink-0 pb-4 pt-2", isExpanded ? "px-3" : "px-2")}>
        <div className={cn("flex gap-1", isExpanded ? "flex-row" : "flex-col")}>
          {/* Language switcher */}
          {mounted && (
            <UtilityButton
              icon={Globe}
              label={locale === "en" ? tLang("en") : tLang("es")}
              isExpanded={isExpanded}
              onClick={toggleLocale}
              tooltipLabel={tLang("toggle")}
              badge={locale.toUpperCase()}
              className="flex-1"
            />
          )}

          {/* Sidebar control */}
          <DropdownMenu onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div>
                <NavTooltip label={t("sidebarControl")} show={!isExpanded}>
                  <button
                    className={cn(
                      "flex items-center justify-center rounded-2xl py-2.5 text-sm text-muted-foreground",
                      "transition-all duration-200 hover:bg-accent/50 hover:text-foreground",
                      isExpanded ? "w-10 px-0" : "w-full px-0",
                    )}
                  >
                    <PanelLeft size={18} strokeWidth={1.5} className="shrink-0" />
                  </button>
                </NavTooltip>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              sideOffset={8}
              align="end"
              className="w-52 overflow-hidden rounded-2xl border border-border/40 bg-popover p-1.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
            >
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-popover-foreground/40">
                {t("sidebarControl")}
              </p>
              {SIDEBAR_MODES.map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => updateMode(value)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-popover-foreground/80 transition-colors focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      mode === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent",
                    )}
                  >
                    {mode === value && (
                      <Check size={5} strokeWidth={3} className="text-primary-foreground p-0.5" />
                    )}
                  </span>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.aside>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ label, show }: { label: string; show: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.p
          key={label}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-0.5 mt-4 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 first:mt-2"
        >
          {label}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

type NavLinkProps = {
  href: string
  label: string
  icon: React.ElementType
  isActive: boolean
  isExpanded: boolean
  external?: boolean
}

function NavLink({ href, label, icon: Icon, isActive, isExpanded, external }: NavLinkProps) {
  const content = (
    <Link
      href={href as "/"}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group relative flex w-full items-center rounded-2xl py-2.5 text-sm transition-all duration-200",
        isExpanded ? "gap-3 px-3" : "justify-center px-0",
        isActive
          ? "bg-accent text-foreground shadow-ambient"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {/* Active left-border accent — always on the left */}
      {isActive && (
        <motion.span
          layoutId="active-pill"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-orange"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <Icon
        size={18}
        strokeWidth={1.5}
        className={cn(
          "shrink-0 transition-colors duration-200",
          isActive ? "text-orange" : "text-muted-foreground group-hover:text-foreground",
        )}
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="whitespace-nowrap font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )

  return (
    <NavTooltip label={label} show={!isExpanded}>
      {content}
    </NavTooltip>
  )
}

type UtilityButtonProps = {
  icon: React.ElementType
  label: string
  isExpanded: boolean
  onClick: () => void
  tooltipLabel: string
  badge?: string
  className?: string
}

function UtilityButton({
  icon: Icon,
  label,
  isExpanded,
  onClick,
  tooltipLabel,
  badge,
  className,
}: UtilityButtonProps) {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center rounded-2xl py-2.5 text-sm text-muted-foreground",
        "transition-all duration-200 hover:bg-accent/50 hover:text-foreground",
        isExpanded ? "gap-3 px-3" : "justify-center px-0",
        className,
      )}
    >
      <Icon size={18} strokeWidth={1.5} className="shrink-0" />
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="overflow-hidden text-ellipsis whitespace-nowrap font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!isExpanded && badge && <span className="sr-only">{badge}</span>}
    </button>
  )

  return (
    <NavTooltip label={tooltipLabel} show={!isExpanded}>
      {button}
    </NavTooltip>
  )
}

function NavTooltip({
  label,
  show,
  children,
}: {
  label: string
  show: boolean
  children: React.ReactNode
}) {
  if (!show) return <>{children}</>

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="rounded-lg border-0 bg-foreground px-3 py-1.5 text-xs text-background shadow-md"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarPromoCard({
  isExpanded,
  verificationStatus,
}: {
  isExpanded: boolean
  verificationStatus: VerificationStatus
}) {
  const t = useTranslations("SidebarPromo")
  const promo = isVerificationApproved(verificationStatus)
    ? "VERIFIED"
    : isRejected(verificationStatus)
      ? "REJECTED"
      : isVerificationInFlight(verificationStatus)
        ? "PENDING"
        : "UNVERIFIED"

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden px-3"
        >
          {promo === "UNVERIFIED" && (
            <div className="rounded-2xl bg-secondary/50 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <ShieldAlert size={10} strokeWidth={2.5} />
                </span>
                <h4 className="text-sm font-medium text-foreground">{t("unverifiedTitle")}</h4>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                {t("unverifiedDesc")}
              </p>
              <Link
                href="/dashboard/account"
                className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background transition-transform hover:scale-[1.02]"
              >
                {t("verifyNow")}
              </Link>
            </div>
          )}

          {promo === "PENDING" && (
            <div className="rounded-2xl bg-secondary/50 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-orange/10">
                  <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-orange opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-orange"></span>
                </div>
                <h4 className="text-sm font-medium text-foreground">{t("pendingTitle")}</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("pendingDesc")}
              </p>
            </div>
          )}

          {promo === "REJECTED" && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <ShieldAlert size={10} strokeWidth={2.5} />
                </span>
                <h4 className="text-sm font-medium text-foreground">{t("rejectedTitle")}</h4>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                {t("rejectedDesc")}
              </p>
              <Link
                href="/dashboard/account"
                className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background transition-transform hover:scale-[1.02]"
              >
                {t("reviewAccount")}
              </Link>
            </div>
          )}

          {promo === "VERIFIED" && (
            <div className="rounded-2xl bg-secondary/30 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
                  <Rocket size={10} strokeWidth={2.5} />
                </span>
                <h4 className="text-sm font-medium text-foreground">{t("verifiedTitle")}</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("verifiedDesc")}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

