"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

const CONTACTS = [
  { key: "acme", name: "Acme Corp LLC" },
  { key: "global", name: "Global Tech Inc" },
  { key: "stripe", name: "Stripe Inc" },
  { key: "aws", name: "Amazon Web Services" },
  { key: "apple", name: "Apple Inc" },
] as const
const PERCENTAGES = [34, 22, 12, 9, 6] as const
const VOLUMES = ["$4.2M", "$2.8M", "$1.5M", "$1.1M", "$800K"] as const
const PIE_VALUES = [34, 22, 12, 9, 6, 17] as const
const COLOR_VARS = [
  "var(--primary)",
  "var(--foreground)",
  "var(--muted-foreground)",
  "var(--secondary-foreground)",
  "var(--border)",
  "var(--secondary)",
] as const

export function DashboardAnalytics() {
  const t = useTranslations("Dashboard.analytics")
  const contacts = React.useMemo(
    () =>
      CONTACTS.map((contact, index) => ({
        key: contact.key,
        name: contact.name,
        volume: VOLUMES[index],
        percentage: PERCENTAGES[index],
      })),
    [],
  )
  const chartData = React.useMemo(
    () => [
      ...CONTACTS.map((contact, index) => ({ name: contact.name, value: PIE_VALUES[index] })),
      { name: "Other", value: PIE_VALUES[5] },
    ],
    [],
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Top Contacts */}
      <div className="flex flex-col rounded-3xl bg-card p-6 shadow-ambient md:p-8">
        <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("topContacts")}
        </h3>
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="space-y-4">
            {contacts.map((contact, i) => (
              <div key={contact.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-secondary/80 text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="font-medium text-foreground">{contact.name}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{contact.volume}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full gap-2 rounded-full hover:bg-secondary hover:text-foreground">
            {t("sendMoney")} <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>

      {/* Volume Split Chart */}
      <div className="flex flex-col rounded-3xl bg-card p-6 shadow-ambient md:p-8">
        <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("volumeSplit")}
        </h3>
        <div className="flex flex-1 items-center justify-center min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLOR_VARS[index % COLOR_VARS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "var(--shadow-ambient)",
                  backgroundColor: "var(--card)",
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
