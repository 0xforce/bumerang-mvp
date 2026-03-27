import { getTranslations } from "next-intl/server"
import { getComplianceProfiles } from "@/queries/admin"
import { ComplianceClient } from "./ComplianceClient"

export default async function CompliancePage() {
  const profiles = await getComplianceProfiles()
  const t = await getTranslations("AdminPortal.compliance")

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <ComplianceClient profiles={profiles} />
    </div>
  )
}
