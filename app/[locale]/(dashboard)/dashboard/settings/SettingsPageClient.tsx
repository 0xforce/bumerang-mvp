"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "./views/ProfileTab"
import { SecurityTab } from "./views/SecurityTab"
import { TeamTab } from "./views/TeamTab"
import { PreferencesTab } from "./views/PreferencesTab"
import type { TeamInvite } from "@/lib/validations/team"

interface SettingsPageClientProps {
  profileData: {
    fullName: string | null
    email: string
    phone: string | null
    organizationName: string | null
  }
  teamData: {
    organizationId: string
    currentUserRole: string
    pendingInvites: TeamInvite[]
  }
  teamDirectory: React.ReactNode
}

export function SettingsPageClient({ profileData, teamData, teamDirectory }: SettingsPageClientProps) {
  const t = useTranslations("Settings")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto w-full max-w-5xl space-y-8 pb-24"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-4xl tracking-wide text-foreground">{t("title")}</h1>
        <Link
          href="/dashboard/settings/workspace"
          className="text-sm font-medium text-primary transition-all duration-300 hover:underline hover:text-primary"
        >
          {t("workspace.manageLink")}
        </Link>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-10 inline-flex h-12 w-full items-center justify-start gap-1 rounded-full bg-secondary/40 p-1 md:w-auto">
          {(
            [
              { value: "profile" as const, labelKey: "tabs.profile" as const },
              { value: "security" as const, labelKey: "tabs.security" as const },
              { value: "team" as const, labelKey: "tabs.team" as const },
              { value: "preferences" as const, labelKey: "tabs.preferences" as const },
            ] as const
          ).map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-ambient"
            >
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <ProfileTab initialData={profileData} />
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="team" className="focus-visible:outline-none">
          <div className="space-y-6">
            <TeamTab
              organizationId={teamData.organizationId}
              currentUserRole={teamData.currentUserRole}
              pendingInvites={teamData.pendingInvites}
            />
            {teamDirectory}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="focus-visible:outline-none">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
