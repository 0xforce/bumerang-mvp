"use client"

import * as React from "react"
import { format, isValid, parseISO, startOfDay, isAfter } from "date-fns"
import { enUS, es } from "date-fns/locale"
import { useLocale } from "next-intl"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type DatePickerInputProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
  /** When true, dates after today cannot be selected (DOB, incorporation, etc.) */
  disableFuture?: boolean
  /** Earliest year in dropdowns */
  fromYear?: number
  /** Latest year in dropdowns */
  toYear?: number
  className?: string
}

function parseValue(value: string | undefined): Date | undefined {
  if (!value || value.length < 10) return undefined
  const d = parseISO(value.slice(0, 10))
  return isValid(d) ? d : undefined
}

const dfLocales = { en: enUS, es } as const

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  disableFuture = true,
  fromYear = 1900,
  toYear,
  className,
}: DatePickerInputProps) {
  const appLocale = useLocale()
  const dfLocale = dfLocales[appLocale as keyof typeof dfLocales] ?? enUS
  const [open, setOpen] = React.useState(false)
  const selected = parseValue(value)
  const yearEnd = toYear ?? new Date().getFullYear()

  // startMonth/endMonth drive the dropdown option ranges (non-deprecated API)
  const startMonth = React.useMemo(() => new Date(fromYear, 0, 1), [fromYear])
  const endMonth = React.useMemo(() => new Date(yearEnd, 11, 31), [yearEnd])

  const defaultMonth = React.useMemo(() => {
    if (selected) return selected
    const d = new Date()
    d.setFullYear(d.getFullYear() - 30)
    return d
  }, [selected])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-10 w-full justify-start gap-2 rounded-2xl border-0 bg-surface px-4 text-left font-normal text-ink shadow-none",
            "hover:scale-100 hover:translate-y-0 hover:bg-surface",
            "focus-visible:shadow-ambient focus-visible:ring-2 focus-visible:ring-orange/30 dark:bg-input dark:text-slate-100 dark:focus:bg-[#111111]",
            !selected && "text-slate",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-[#64748B]" strokeWidth={1.5} />
          <span className="truncate">
            {selected ? format(selected, "PPP", { locale: dfLocale }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-0 p-0 shadow-ambient" align="start">
        <Calendar
          mode="single"
          locale={dfLocale}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          defaultMonth={defaultMonth}
          selected={selected}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          disabled={
            disableFuture
              ? (d) => isAfter(startOfDay(d), startOfDay(new Date()))
              : undefined
          }
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
