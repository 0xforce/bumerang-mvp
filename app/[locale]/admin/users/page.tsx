import { getTranslations } from "next-intl/server"

import { getAdminUsersAggregated } from "@/queries/admin"
import { createClient } from "@/utils/supabase/server"
import { getInternalUserRole } from "@/lib/admin-access"

import { UsersClient } from "./UsersClient"

export default async function UsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const users = await getAdminUsersAggregated()
  const t = await getTranslations("AdminPortal.users")
  const viewerRole = user ? await getInternalUserRole(user.id) : null

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("subtitle")}</p>
      </div>

      <UsersClient users={users} viewerRole={viewerRole} currentUserId={user?.id ?? null} />
    </div>
  )
}
