"use client"

import * as React from "react"
import { ConfirmDialog } from "@/components/global/ConfirmDialog"

export type ConfirmVariant = "default" | "destructive" | "energy"

export interface ConfirmOptions {
  title?: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<ConfirmFn>(() =>
  Promise.resolve(false)
)

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions>({})
  const resolveRef = React.useRef<(value: boolean) => void>(null)

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts ?? {})
      setOpen(true)
      resolveRef.current = resolve
    })
  }, [])

  function handleConfirm() {
    setOpen(false)
    resolveRef.current?.(true)
  }

  function handleCancel() {
    setOpen(false)
    resolveRef.current?.(false)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={open}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  return React.useContext(ConfirmContext)
}
