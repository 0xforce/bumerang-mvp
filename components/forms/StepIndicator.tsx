"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        /** Line *before* this step (between previous circle and this one) is filled when we've reached this step or beyond */
        const connectorBeforeFilled = index > 0 && index <= currentStep

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div className="relative mx-2 h-px min-w-4 flex-1 self-center">
                <div className="absolute inset-0 bg-[#f8f9fa] dark:bg-input" />
                <div
                  className={cn(
                    "absolute inset-0 origin-left bg-[#f94212] transition-transform duration-500 ease-out",
                    connectorBeforeFilled ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </div>
            )}

            <div className="flex shrink-0 flex-col items-center gap-2">
              <div
                className={cn(
                  "relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-[#f94212] text-white shadow-[0_6px_16px_-4px_rgba(249,66,18,0.4)]",
                  isActive &&
                    "bg-[#f94212] text-white shadow-[0_6px_20px_-4px_rgba(249,66,18,0.5)] ring-4 ring-[#f94212]/15",
                  !isCompleted &&
                    !isActive &&
                    "bg-[#f8f9fa] text-[#64748b] dark:bg-input dark:text-slate-500",
                )}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <p
                className={cn(
                  "w-full max-w-22 text-center text-[10px] font-semibold uppercase leading-tight tracking-widest transition-colors duration-200",
                  isActive
                    ? "text-[#f94212]"
                    : isCompleted
                      ? "text-[#0a0a0a] dark:text-slate-300"
                      : "text-[#64748b] dark:text-slate-600",
                )}
              >
                {label}
              </p>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
