"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COUNTRIES } from "@/lib/data/countries"

interface CountrySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Forwarded for aria-invalid from RHF */
  "aria-invalid"?: boolean
}

export const CountrySelect = React.forwardRef<
  HTMLButtonElement,
  CountrySelectProps
>(
  (
    {
      value,
      onValueChange,
      placeholder,
      disabled,
      className,
      "aria-invalid": ariaInvalid,
    },
    ref
  ) => {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger ref={ref} aria-invalid={ariaInvalid} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-64 rounded-2xl">
          <SelectGroup>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
)

CountrySelect.displayName = "CountrySelect"
