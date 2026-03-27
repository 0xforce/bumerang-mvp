import { getTranslations } from "next-intl/server"

export default async function AdminOverviewPage() {
  const t = await getTranslations("AdminPortal.overview")
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

      <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-ambient">
        {t("empty")}
      </div>
    </div>
  )
}
