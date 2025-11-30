"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Server, Users, Route, Wifi, WifiOff, Activity, Database, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GuideCard } from "@/components/ui/guide-card";
import { useMachines } from "@/lib/hooks/use-machines";
import { useUsers } from "@/lib/hooks/use-users";
import { useRoutes } from "@/lib/hooks/use-routes";
import { useHealth } from "@/lib/hooks/use-health";

export default function Dashboard() {
  const t = useTranslations("pages.dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: machines, isPending: machinesPending } = useMachines();
  const { data: users, isPending: usersPending } = useUsers();
  const { data: routes, isPending: routesPending } = useRoutes();
  const { data: health, isPending: healthPending } = useHealth();
  
  // Track client-side mount to prevent hydration mismatch
  const [isMounted] = useState(() => typeof window !== "undefined");

  const onlineMachines = machines?.filter((m) => m.online).length || 0;
  const totalMachines = machines?.length || 0;
  const totalUsers = users?.length || 0;
  const enabledRoutes = routes?.filter((r) => r.enabled).length || 0;
  const totalRoutes = routes?.length || 0;
  const onlinePercentage = totalMachines > 0 ? (onlineMachines / totalMachines) * 100 : 0;

  const stats = [
    {
      name: t("totalMachines"),
      value: totalMachines,
      icon: Server,
      description: `${onlineMachines} ${t("online")}`,
    },
    {
      name: t("totalUsers"),
      value: totalUsers,
      icon: Users,
      description: t("activeUsers"),
    },
    {
      name: t("routes"),
      value: totalRoutes,
      icon: Route,
      description: `${enabledRoutes} ${t("enabled")}`,
    },
    {
      name: t("onlineStatus"),
      value: `${onlinePercentage.toFixed(0)}%`,
      icon: onlineMachines > 0 ? Wifi : WifiOff,
      description: `${onlineMachines}/${totalMachines} ${t("online")}`,
      variant: onlineMachines > 0 ? "success" : "default",
    },
    {
      name: t("systemHealth"),
      value: health?.databaseConnectivity ? t("healthy") : t("degraded"),
      icon: Database,
      description: health?.databaseConnectivity ? t("allSystemsOperational") : t("databaseIssues"),
      variant: health?.databaseConnectivity ? "success" : "danger",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {(!isMounted || machinesPending || usersPending || routesPending || healthPending) ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="card-hover animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {isMounted && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t("quickActions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link
                  href={`/${locale}/machines`}
                  className="block rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-foreground">{t("viewAllMachines")}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalMachines} {t("totalMachinesLabel")}
                  </div>
                </Link>
                <Link
                  href={`/${locale}/users`}
                  className="block rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-foreground">{t("manageUsers")}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalUsers} {t("totalUsersLabel")}
                  </div>
                </Link>
                <Link
                  href={`/${locale}/routes`}
                  className="block rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-foreground">{t("configureRoutes")}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalRoutes} {t("totalRoutesLabel")}
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("systemStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("databaseConnectivity")}
                  </span>
                  <Badge
                    variant={health?.databaseConnectivity ? "default" : "destructive"}
                  >
                    {health?.databaseConnectivity ? tCommon("connected") : tCommon("disconnected")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("machinesOnline")}
                  </span>
                  <span className="font-medium text-foreground">
                    {onlineMachines} / {totalMachines}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("routesEnabled")}
                  </span>
                  <span className="font-medium text-foreground">
                    {enabledRoutes} / {totalRoutes}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          )}
        </>
      )}

      <GuideCard
        title={t("gettingStarted")}
        description={t("gettingStartedDesc")}
        sections={[
          {
            title: t("overview"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("overviewDesc")}
                </p>
                <p>
                  {t("overviewDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("quickStart"),
            content: (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <div>
                    <p className="font-medium">{t("quickStart1")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.rich("quickStart1Desc", {
                        setup: (chunks) => <Link key="setup" href={`/${locale}/setup`} className="text-primary hover:underline">{chunks}</Link>
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <div>
                    <p className="font-medium">{t("quickStart2")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.rich("quickStart2Desc", {
                        preauthKeys: (chunks) => <Link key="preauth" href={`/${locale}/preauth-keys`} className="text-primary hover:underline">{chunks}</Link>
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <div>
                    <p className="font-medium">{t("quickStart3")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.rich("quickStart3Desc", {
                        machines: (chunks) => <Link key="machines" href={`/${locale}/machines`} className="text-primary hover:underline">{chunks}</Link>
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: t("keyFeatures"),
            content: (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <span><strong>{tCommon("machines")}:</strong> {t("machinesFeature")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span><strong>{tCommon("users")}:</strong> {t("usersFeature")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  <span><strong>{tCommon("routes")}:</strong> {t("routesFeature")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span><strong>{tCommon("acls")}:</strong> {t("aclsFeature")}</span>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
