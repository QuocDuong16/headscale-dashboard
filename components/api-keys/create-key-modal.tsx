"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateApiKey } from "@/lib/hooks/use-api-keys";

interface CreateKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateKeyModal({ open, onClose }: CreateKeyModalProps) {
  const tApiKey = useTranslations("pages.apiKeys");
  const tCommon = useTranslations("common");
  const [expiration, setExpiration] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createKey = useCreateApiKey();

  const handleCreate = () => {
    if (!expiration.trim()) {
      return; // Don't create if expiration is empty
    }
    
    // Convert from DatePicker format (YYYY-MM-DDTHH:mm) to RFC3339 full format (YYYY-MM-DDTHH:mm:ssZ)
    // DatePicker returns format like "2026-12-30T17:00" but API needs "2026-12-30T17:00:00Z"
    // Parse the string and append seconds and UTC timezone
    const dateStr = expiration.trim();
    let expirationDate: string;
    
    // Validate format: YYYY-MM-DDTHH:mm
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) {
      // Append seconds and UTC timezone: YYYY-MM-DDTHH:mm:ssZ
      expirationDate = `${dateStr}:00Z`;
    } else {
      // Fallback: try parsing as Date and convert to ISO
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return; // Invalid date
      }
      expirationDate = date.toISOString();
    }
    
    createKey.mutate(
      { expiration: expirationDate },
      {
        onSuccess: (data) => {
          setCreatedKey(data.apiKey);
          setExpiration("");
        },
      }
    );
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCreatedKey(null);
    setExpiration("");
    setCopied(false);
    onClose();
  };

  const setExpirationFromDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 0, 0); // Set to end of day
    // Format as YYYY-MM-DDTHH:mm for DatePicker
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    setExpiration(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <Modal open={open} onClose={handleClose} title={tApiKey("createKeyModal")} size="md">
      <div className="space-y-4">
        {createdKey ? (
          <div className="space-y-4">
            <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                {tApiKey("importantSaveKey")}
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>{tApiKey("apiKey")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>{tApiKey("done")}</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>
                {tApiKey("expirationDate")} <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpirationFromDays(30)}
                >
                  {tApiKey("expireIn30Days")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpirationFromDays(180)}
                >
                  {tApiKey("expireIn180Days")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpirationFromDays(9999)}
                >
                  {tApiKey("expireIn9999Days")}
                </Button>
              </div>
              <DatePicker
                value={expiration}
                onChange={setExpiration}
                placeholder={tApiKey("selectExpirationDate")}
                showTime={true}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                {tCommon("cancel")}
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createKey.isPending || !expiration.trim()}
              >
                {createKey.isPending ? tApiKey("creating") : tApiKey("createKeyButton")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

