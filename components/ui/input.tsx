import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-2xl border-0 bg-surface px-4 py-2 text-sm text-ink outline-none transition-all duration-300 caret-orange placeholder:text-slate file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink focus:bg-white focus:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-orange/30 dark:bg-input dark:text-slate-100 dark:focus:bg-[#111111] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
