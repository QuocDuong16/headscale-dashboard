"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LayoutDashboard,
  Server,
  Users,
  Route,
  Key,
  Shield,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function Sidebar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const navigation = [
    { name: t("common.dashboard"), href: `/${locale}`, icon: LayoutDashboard },
    { name: t("common.setup"), href: `/${locale}/setup`, icon: Settings },
    { name: t("common.machines"), href: `/${locale}/machines`, icon: Server },
    { name: t("common.users"), href: `/${locale}/users`, icon: Users },
    { name: t("common.routes"), href: `/${locale}/routes`, icon: Route },
    { name: t("common.preauthKeys"), href: `/${locale}/preauth-keys`, icon: Key },
    { name: t("common.apiKeys"), href: `/${locale}/api-keys`, icon: Key },
    { name: t("common.acls"), href: `/${locale}/acls`, icon: Shield },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/50 bg-background/60 backdrop-blur-md">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-foreground">{t("sidebar.headscale")}</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

