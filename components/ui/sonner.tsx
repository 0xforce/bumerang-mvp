"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Sculpted Geometry Toaster — "Floating Capsule" design.
 *
 * Each toast is a wide pill with a vivid left-edge accent stripe that
 * signals the toast type at a glance. The card surface adapts cleanly
 * to light and dark modes using our design tokens.
 */
function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            // Capsule shell
            "group/toast relative flex w-[360px] items-start gap-3 overflow-hidden",
            "rounded-2xl p-4",
            // Surface
            "bg-white dark:bg-[#111111]",
            // Ambient shadow
            "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
            // Soft outline
            "ring-1 ring-black/[0.06] dark:ring-white/[0.07]",
            // Entrance animation
            "data-[mounted=true]:animate-in data-[mounted=true]:slide-in-from-bottom-3 data-[mounted=true]:fade-in-0",
            "duration-300",
          ].join(" "),

          // Accent stripes per type — pseudo-element via before: is unreliable
          // in sonner, so we use a left border on the content wrapper instead.
          // These are appended to the toast class by sonner's type system:
          success:
            "border-l-[3px] border-l-emerald-400 dark:border-l-emerald-500",
          error: "border-l-[3px] border-l-red-400 dark:border-l-red-500",
          warning:
            "border-l-[3px] border-l-amber-400 dark:border-l-amber-500",
          info: "border-l-[3px] border-l-blue-400 dark:border-l-blue-500",
          loading:
            "border-l-[3px] border-l-slate-300 dark:border-l-slate-600",

          // Typography
          title:
            "text-sm font-semibold leading-snug text-[#0a0a0a] dark:text-slate-100",
          description:
            "mt-0.5 text-xs leading-relaxed text-[#64748b] dark:text-slate-400",

          // Icon
          icon: "mt-0.5 shrink-0 text-[#64748b] dark:text-slate-400",

          // Action button — pill, energy color
          actionButton: [
            "mt-3 inline-flex h-7 items-center justify-center rounded-full",
            "bg-[#f94212] px-4 text-xs font-semibold text-white",
            "transition-all duration-200 hover:scale-[1.02] hover:bg-[#f94212]/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f94212]/50",
          ].join(" "),

          // Cancel button — subtle pill
          cancelButton: [
            "mt-3 inline-flex h-7 items-center justify-center rounded-full",
            "bg-[#f8f9fa] dark:bg-input px-4 text-xs font-medium",
            "text-[#0a0a0a] dark:text-slate-300",
            "transition-all duration-200 hover:scale-[1.02]",
          ].join(" "),

          // Dismiss ×
          closeButton: [
            "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full",
            "bg-[#f8f9fa] dark:bg-input",
            "text-[#64748b] dark:text-slate-400",
            "ring-1 ring-black/[0.06] dark:ring-white/[0.08]",
            "opacity-0 transition-opacity duration-150",
            "group-hover/toast:opacity-100",
          ].join(" "),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
