"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn({
          "max-w-sm": size === "sm",
          "max-w-md": size === "md",
          "max-w-lg": size === "lg",
          "max-w-2xl": size === "xl",
        })}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogDescription className={description ? "" : "sr-only"}>
              {description || (title || "Dialog")}
            </DialogDescription>
          </DialogHeader>
        )}
        {!title && !description && (
          <DialogDescription className="sr-only">Dialog</DialogDescription>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

