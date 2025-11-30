"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { 
  Monitor, 
  Apple, 
  Key, 
  AlertCircle,
  ExternalLink
} from "lucide-react";

// Linux icon component
const Linux = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.265-.45.558-.796.558-.345 0-.537-.293-.796-.558a.424.424 0 00-.11-.135c.123-.805-.01-1.657-.287-2.489-.589-1.771-1.831-3.47-2.716-4.521-.75-1.067-1.024-1.928-1.05-3.02-.065-1.491-1.056-5.965-3.17-6.298C1.811.008 1.651 0 1.496 0H0v24h24V0H12.504zM1.957 1.754c.939-.032 1.245 1.027 1.305 2.588.07 1.785.315 2.695 1.05 3.655.744.97 1.826 2.066 2.4 3.465.287.699.4 1.38.4 2.1 0 .66-.15 1.23-.45 1.77.3-.54.45-1.11.45-1.77 0-.72.113-1.401.4-2.1.574-1.399 1.656-2.495 2.4-3.465.735-.96.98-1.87 1.05-3.655.06-1.561.366-2.62 1.305-2.588H1.957z"/>
  </svg>
);

export function SetupGuide() {
  const t = useTranslations("pages.setup");
  const locale = useLocale();
  const [selectedPlatform, setSelectedPlatform] = useState<"linux" | "windows" | "macos">("linux");

  const platforms = {
    linux: {
      name: "Linux",
      icon: Linux,
      steps: [
        {
          title: t("installTailscale"),
          description: t("linux.installDesc"),
          commands: [
            "# Ubuntu/Debian",
            "curl -fsSL https://tailscale.com/install.sh | sh",
            "",
            "# Fedora/RHEL",
            "sudo dnf install tailscale",
            "",
            "# Arch Linux",
            "sudo pacman -S tailscale",
          ],
        },
        {
          title: t("startTailscale"),
          description: t("linux.startDesc"),
          commands: [
            "sudo systemctl enable --now tailscaled",
          ],
        },
        {
          title: t("connectToHeadscale"),
          description: t("linux.connectDesc"),
          commands: [
            "# Replace YOUR_PREAUTH_KEY with your actual pre-auth key",
            "sudo tailscale up --login-server=https://vpn.niand.id.vn --authkey=YOUR_PREAUTH_KEY",
          ],
          note: t("preAuthKeyAlert"),
        },
        {
          title: t("verifyConnection"),
          description: t("linux.verifyDesc"),
          commands: [
            "sudo tailscale status",
          ],
        },
      ],
    },
    windows: {
      name: "Windows",
      icon: Monitor,
      steps: [
        {
          title: t("installTailscale"),
          description: t("windows.downloadDesc"),
          commands: [
            "# Download from: https://tailscale.com/download/windows",
            "# Or use winget:",
            "winget install Tailscale.Tailscale",
          ],
        },
        {
          title: t("startTailscale"),
          description: t("windows.installDesc"),
          commands: [
            "# Run the installer and follow the setup wizard",
            "# Tailscale will start automatically after installation",
          ],
        },
        {
          title: t("connectToHeadscale"),
          description: t("windows.connectDesc"),
          commands: [
            "# Open PowerShell as Administrator",
            "# Replace YOUR_PREAUTH_KEY with your actual pre-auth key",
            "tailscale up --login-server=https://vpn.niand.id.vn --authkey=YOUR_PREAUTH_KEY",
          ],
          note: t("preAuthKeyAlert"),
        },
        {
          title: t("verifyConnection"),
          description: t("windows.verifyDesc"),
          commands: [
            "tailscale status",
          ],
        },
      ],
    },
    macos: {
      name: "macOS",
      icon: Apple,
      steps: [
        {
          title: t("installTailscale"),
          description: t("macos.installDesc"),
          commands: [
            "# Using Homebrew:",
            "brew install --cask tailscale",
            "",
            "# Or download from: https://tailscale.com/download/macos",
          ],
        },
        {
          title: t("startTailscale"),
          description: t("macos.startDesc"),
          commands: [
            "# Open Tailscale from Applications folder",
            "# Or run from terminal:",
            "open /Applications/Tailscale.app",
          ],
        },
        {
          title: t("connectToHeadscale"),
          description: t("macos.connectDesc"),
          commands: [
            "# Open Terminal",
            "# Replace YOUR_PREAUTH_KEY with your actual pre-auth key",
            "sudo tailscale up --login-server=https://vpn.niand.id.vn --authkey=YOUR_PREAUTH_KEY",
          ],
          note: t("preAuthKeyAlert"),
        },
        {
          title: t("verifyConnection"),
          description: t("macos.verifyDesc"),
          commands: [
            "tailscale status",
          ],
        },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t.rich("preAuthKeyAlert", {
            preauthKeys: (chunks) => (
              <Link key="preauth" href={`/${locale}/preauth-keys`} className="text-primary hover:underline font-medium">
                {chunks}
              </Link>
            )
          })}
        </AlertDescription>
      </Alert>

      <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as "linux" | "windows" | "macos")}>
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(platforms).map(([key, platform]) => {
            const Icon = platform.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {platform.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(platforms).map(([key, platform]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {platform.steps.map((step, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {step.note && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {step.note}
                      </AlertDescription>
                    </Alert>
                  )}
                  <CodeBlock code={step.commands.join("\n")} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("needPreAuthKey")}
          </CardTitle>
          <CardDescription>
            {t("needPreAuthKeyDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/${locale}/preauth-keys`}>
              {t("goToPreAuthKeys")}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
