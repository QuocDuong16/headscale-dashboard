"use client"

import { useState, useCallback } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ConfirmOptions {
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
  }, [])

  const handleConfirm = useCallback(() => {
    if (options?.onConfirm) {
      options.onConfirm()
    }
    setOpen(false)
    setOptions(null)
  }, [options])

  const DialogComponent = options ? (
    <ConfirmDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setOptions(null)
        }
      }}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
    />
  ) : null

  return {
    showConfirm,
    DialogComponent,
  }
}

