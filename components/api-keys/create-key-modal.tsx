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
    createKey.mutate(
      {
        expiration: expiration || undefined,
      },
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
                {tApiKey("expirationDateOptional")}
              </Label>
              <DatePicker
                value={expiration}
                onChange={setExpiration}
                placeholder={tApiKey("selectExpirationDate")}
                showTime={true}
              />
              <p className="text-xs text-muted-foreground">
                {tApiKey("leaveEmptyNoExpiration")}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={createKey.isPending}>
                {createKey.isPending ? tApiKey("creating") : tApiKey("createKeyButton")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

