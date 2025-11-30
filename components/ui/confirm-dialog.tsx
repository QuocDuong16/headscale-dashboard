"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("common")
  
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }
  
  const defaultConfirmText = confirmText || t("confirm")
  const defaultCancelText = cancelText || t("cancel")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {defaultCancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {defaultConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

