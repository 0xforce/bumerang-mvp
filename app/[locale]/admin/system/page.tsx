import { getTranslations } from "next-intl/server"
import { getNotificationDeliveries, getSystemEvents } from "@/queries/admin"
import { SystemClient } from "./SystemClient"

export default async function SystemPage() {
  const t = await getTranslations("AdminPortal.system")
  const [deliveries, events] = await Promise.all([
    getNotificationDeliveries(),
    getSystemEvents(),
  ])

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

      <SystemClient deliveries={deliveries} events={events} />
    </div>
  )
}
