"use client";

import { useState, useLayoutEffect } from "react";
import { Key, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/auth-context";
import { useHealth } from "@/lib/hooks/use-health";
import { testToken } from "@/lib/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const t = useTranslations();
  const { token, setToken, isAuthenticated } = useAuth();
  const { data: health } = useHealth();
  const { theme, setTheme } = useTheme();
  // Initialize as empty to avoid hydration mismatch
  const [inputToken, setInputToken] = useState("");
  // Track if component has mounted on client
  const [mounted, setMounted] = useState(false);
  // Track token testing state
  const [isTestingToken, setIsTestingToken] = useState(false);

  // Set mounted and sync inputToken after mount to avoid hydration mismatch
  // This is a legitimate use case for setState in effect (hydration)
  useLayoutEffect(() => {
    setMounted(true);
    if (token) {
      setInputToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveToken = async () => {
    const tokenValue = inputToken.trim();
    
    if (!tokenValue) {
      toast.error(t("header.tokenError"));
      return;
    }

    setIsTestingToken(true);
    try {
      // Test token before saving
      const isValid = await testToken(tokenValue);
      
      if (isValid) {
        setToken(tokenValue);
        toast.success(t("header.tokenSaved"));
      } else {
        toast.error(t("header.tokenInvalid"));
      }
    } catch {
      toast.error(t("header.tokenTestFailed"));
    } finally {
      setIsTestingToken(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setInputToken("");
    toast.info(t("header.loggedOut"));
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/70 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {t("header.apiToken")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="password"
            placeholder={t("header.enterApiToken")}
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="w-64"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveToken();
              }
            }}
          />
          <Button 
            onClick={handleSaveToken} 
            size="sm"
            disabled={isTestingToken || !inputToken.trim()}
          >
            {isTestingToken ? t("header.testing") : t("header.save")}
          </Button>
        </div>
            {mounted && isAuthenticated && (
              <div className="flex items-center gap-3">
                <Badge variant="default" className="gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {t("common.connected")}
                </Badge>
                {health && (
                  <Badge
                    variant={health.databaseConnectivity ? "default" : "destructive"}
                    className="gap-2"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        health.databaseConnectivity
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    {t("header.dbStatus")}: {health.databaseConnectivity ? t("common.success") : t("common.error")}
                  </Badge>
                )}
              </div>
            )}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={t("header.toggleTheme")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("header.toggleTheme")}</span>
        </Button>
        {mounted && isAuthenticated && (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("header.logout")}
          </Button>
        )}
      </div>
    </header>
  );
}

