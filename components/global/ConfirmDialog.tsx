"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ConfirmOptions, ConfirmVariant } from "@/hooks/use-confirm"

interface ConfirmDialogProps {
  open: boolean
  options: ConfirmOptions
  onConfirm: () => void
  onCancel: () => void
}

const variantConfirmStyles: Record<ConfirmVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60",
  energy:
    "bg-[#f94212] text-white hover:bg-[#f94212]/90 shadow-[0_8px_24px_-6px_rgba(249,66,18,0.35)]",
}

export function ConfirmDialog({
  open,
  options,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations("Common")

  const {
    title = t("areYouSure"),
    description = t("actionIrreversible"),
    confirmText = t("confirm"),
    cancelText = t("cancel"),
    variant = "default",
  } = options

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogPrimitive.Portal>
        {/* Overlay */}
        <AlertDialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50",
            "bg-black/20 dark:bg-black/50",
            "supports-backdrop-filter:backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-200"
          )}
        />

        {/* Panel */}
        <AlertDialogPrimitive.Content
          className={cn(
            // Position
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            // Shape
            "w-full max-w-md rounded-3xl",
            // Surface
            "bg-white dark:bg-[#111111]",
            // Ambient shadow
            "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]",
            // Soft outline
            "ring-1 ring-black/6 dark:ring-white/[0.07]",
            // Spacing
            "p-8",
            // Animation
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-200 outline-none"
          )}
        >
          {/* Geometric accent — a tiny energy-colored pulse dot */}
          <span
            className={cn(
              "mb-6 flex size-10 items-center justify-center rounded-2xl",
              variant === "destructive"
                ? "bg-red-50 dark:bg-red-950/40"
                : variant === "energy"
                  ? "bg-[#f94212]/10"
                  : "bg-[#f8f9fa] dark:bg-input"
            )}
            aria-hidden
          >
            <span
              className={cn(
                "size-3 rounded-full",
                variant === "destructive"
                  ? "bg-red-400 dark:bg-red-500"
                  : variant === "energy"
                    ? "bg-[#f94212]"
                    : "bg-[#64748b] dark:bg-slate-500"
              )}
            />
          </span>

          {/* Title */}
          <AlertDialogPrimitive.Title className="font-display text-2xl uppercase tracking-tight text-[#0a0a0a] dark:text-slate-100">
            {title}
          </AlertDialogPrimitive.Title>

          {/* Description */}
          {description && (
            <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-[#64748b] dark:text-slate-400">
              {description}
            </AlertDialogPrimitive.Description>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-row-reverse gap-3">
            <AlertDialogPrimitive.Action asChild>
              <Button
                className={cn(
                  "rounded-full px-6 transition-all duration-200 hover:scale-[1.02]",
                  variantConfirmStyles[variant]
                )}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </AlertDialogPrimitive.Action>

            <AlertDialogPrimitive.Cancel asChild>
              <Button
                variant="secondary"
                className="rounded-full px-6 transition-all duration-200 hover:scale-[1.02]"
                onClick={onCancel}
              >
                {cancelText}
              </Button>
            </AlertDialogPrimitive.Cancel>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
