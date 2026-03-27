"use client"

import * as React from "react"

export function DashboardKPIs() {
  const kpis = [
    {
      id: "volume",
      label: "Volume Processed",
      value: "$12.4M",
      trend: "+14.2%",
      isPositive: true,
    },
    {
      id: "saved",
      label: "$ Saved",
      value: "$45,200",
      trend: "+5.4%",
      isPositive: true,
    },
    {
      id: "time",
      label: "Time Saved (Hours)",
      value: "142",
      trend: "+12.1%",
      isPositive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="flex flex-col justify-between rounded-3xl bg-card p-6 shadow-ambient md:p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {kpi.label}
          </span>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl tabular-nums tracking-tight text-foreground lg:text-5xl">
              {kpi.value}
            </span>
            <span className="text-sm font-medium text-primary">
              {kpi.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
