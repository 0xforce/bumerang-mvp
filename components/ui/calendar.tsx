"use client"

import * as React from "react"
import { DayPicker, type DropdownProps } from "react-day-picker"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import "react-day-picker/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
}: DropdownProps) {
  const opts = options ?? []
  const strValue = value !== undefined && value !== null ? String(value) : ""
  
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      const event = {
        target: { value: newValue },
      } as React.ChangeEvent<HTMLSelectElement>
      onChange(event)
    }
  }

  return (
    <Select value={strValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className="w-fit min-w-28 shrink-0 font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent 
        position="popper" 
        side="bottom" 
        sideOffset={4}
        className="max-h-[250px] rounded-2xl border-none shadow-ambient dark:bg-input dark:text-slate-100"
      >
        {opts.map((opt) => (
          <SelectItem 
            key={String(opt.value)} 
            value={String(opt.value)}
            disabled={opt.disabled}
            className="rounded-xl focus:bg-orange/10 focus:text-orange"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  navLayout = "around",
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      navLayout={navLayout}
      showOutsideDays={showOutsideDays}
      className={cn("p-4 select-none w-fit", className)}
      classNames={{
        root: cn("rdp-root font-sans text-sm text-slate-900 dark:text-slate-100"),
        months: "rdp-months flex flex-col",
        month: cn("rdp-month space-y-4"),

        month_caption: cn("rdp-month_caption flex h-9 items-center justify-center pt-1"),
        caption_label: "hidden", 
        dropdowns: cn("rdp-dropdowns relative z-10 flex items-center justify-center gap-2"),
        
        button_previous: cn(
          "rdp-button_previous absolute left-1 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full",
          "text-slate-500 transition-colors hover:!bg-slate-100 hover:!text-slate-900",
          "dark:text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-slate-100",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        button_next: cn(
          "rdp-button_next absolute right-1 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full",
          "text-slate-500 transition-colors hover:!bg-slate-100 hover:!text-slate-900",
          "dark:text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-slate-100",
          "disabled:pointer-events-none disabled:opacity-30",
        ),

        // THE GRID FIX: Removed flexbox completely. Using standard table alignment.
        month_grid: "rdp-month_grid w-full border-collapse",
        weekdays: "table-row", // Native table row
        weekday: cn(
          "rdp-weekday text-center align-middle font-bold uppercase tracking-widest text-[10px] text-slate-400 dark:text-slate-500 pb-3 pt-1",
        ), 
        week: "table-row", // Native table row
        day: "rdp-day p-0 text-center align-middle", // Let the table naturally align the cells
        
        day_button: cn(
          "rdp-day_button mx-auto inline-flex h-9 w-9 items-center justify-center rounded-full p-0 text-sm", // mx-auto guarantees perfect horizontal centering in the td
          "font-medium text-slate-800 dark:text-slate-200 transition-colors",
          "hover:!bg-slate-100 dark:hover:!bg-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
        ),

        selected: cn(
          "[&>button]:!bg-orange [&>button]:!text-white [&>button]:!font-bold [&>button]:!shadow-sm",
          "hover:[&>button]:!bg-orange/90"
        ),
        today: cn(
          "[&:not(.rdp-day_selected)>button]:!bg-orange/10 [&:not(.rdp-day_selected)>button]:!text-orange [&:not(.rdp-day_selected)>button]:!font-bold"
        ),
        outside: cn(
          "pointer-events-none",
          "[&>button]:text-slate-300 dark:[&>button]:text-slate-700",
          "[&>button]:hover:!bg-transparent"
        ),
        disabled: cn(
          "pointer-events-none",
          "[&>button]:opacity-30 [&>button]:hover:!bg-transparent"
        ),
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: ({ orientation }) => {
          if (orientation === "left")
            return <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          if (orientation === "right")
            return <ChevronRight className="h-4 w-4" strokeWidth={2} />
          return <ChevronDown className="h-4 w-4" strokeWidth={2} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
