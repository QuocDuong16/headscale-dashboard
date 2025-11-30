"use client";

import { useState } from "react";
import { Key } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { testToken } from "@/lib/api/client";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

interface TokenRequiredModalProps {
  open: boolean;
  onTokenValid: (token: string) => void;
}

export function TokenRequiredModal({ open, onTokenValid }: TokenRequiredModalProps) {
  const t = useTranslations();
  const [inputToken, setInputToken] = useState("");
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveToken = async () => {
    const tokenValue = inputToken.trim();
    
    if (!tokenValue) {
      setError(t("header.tokenError"));
      return;
    }

    setIsTestingToken(true);
    setError(null);
    
    try {
      // Test token before saving
      const isValid = await testToken(tokenValue);
      
      if (isValid) {
        onTokenValid(tokenValue);
        setInputToken("");
        setError(null);
      } else {
        setError(t("header.tokenInvalid"));
      }
    } catch {
      setError(t("header.tokenTestFailed"));
    } finally {
      setIsTestingToken(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          // Prevent closing by clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing by pressing Escape
          e.preventDefault();
        }}
        showCloseButton={false}
      >
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-primary" />
            <DialogTitle>{t("header.apiToken")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("tokenModal.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder={t("header.enterApiToken")}
              value={inputToken}
              onChange={(e) => {
                setInputToken(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isTestingToken && inputToken.trim()) {
                  handleSaveToken();
                }
              }}
              disabled={isTestingToken}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button 
            onClick={handleSaveToken} 
            className="w-full"
            disabled={isTestingToken || !inputToken.trim()}
          >
            {isTestingToken 
              ? t("header.testing")
              : t("header.save")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

