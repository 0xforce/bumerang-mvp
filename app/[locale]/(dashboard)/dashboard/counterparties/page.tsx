import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/utils/supabase/server"
import { getActiveOrganizationContext } from "@/queries/active-workspace"
import { getCounterparties } from "@/actions/counterparties"
import { CounterpartiesLedger } from "./views/CounterpartiesLedger"
import { CounterpartiesEmptyState } from "./views/CounterpartiesEmptyState"
import { AddCounterpartyDialog } from "./views/AddCounterpartyDialog"
import { Button } from "@/components/ui/button"

export default async function CounterpartiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const orgContext = await getActiveOrganizationContext(user.id)
  if (!orgContext) redirect(`/${locale}/onboarding`)

  const result = await getCounterparties(orgContext.organizationId)
  const counterparties = result.success ? (result.data ?? []) : []

  const t = await getTranslations("Counterparties")

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-24">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <h1 className="font-display text-4xl tracking-wide text-foreground">{t("title")}</h1>
        <AddCounterpartyDialog organizationId={orgContext.organizationId}>
          <Button className="rounded-full shadow-ambient">{t("addBtn")}</Button>
        </AddCounterpartyDialog>
      </div>

      {counterparties.length > 0 ? (
        <CounterpartiesLedger
          data={counterparties}
          organizationId={orgContext.organizationId}
        />
      ) : (
        <CounterpartiesEmptyState organizationId={orgContext.organizationId} />
      )}
    </div>
  )
}
