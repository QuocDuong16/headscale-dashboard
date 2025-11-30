"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  Clock,
  Server,
  Route,
  Tag,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMachine } from "@/lib/hooks/use-machines";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { MoveMachineModal } from "./move-machine-modal";
import { ManageRoutesModal } from "./manage-routes-modal";
import { ManageTagsModal } from "./manage-tags-modal";
import {
  useDeleteMachine,
  useExpireMachine,
} from "@/lib/hooks/use-machines";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";

interface MachineDetailProps {
  machineId: string;
}

type Tab = "overview" | "routes" | "tags" | "activity";

export function MachineDetail({ machineId }: MachineDetailProps) {
  const t = useTranslations("components.confirm");
  const tCommon = useTranslations("common");
  const tMachine = useTranslations("pages.machines");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isRoutesOpen, setIsRoutesOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const { data: machine, isPending, error } = useMachine(machineId);
  const [isMounted] = useState(() => typeof window !== "undefined");
  const deleteMachine = useDeleteMachine();
  const expireMachine = useExpireMachine();
  const { showConfirm, DialogComponent } = useConfirmDialog();

  if (!isMounted || isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/machines`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon("machines")}
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            {error
              ? tMachine("errorLoading", { error: error.message })
              : tMachine("machineNotFound")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Wifi }[] = [
    { id: "overview", label: tMachine("overview"), icon: Server },
    { id: "routes", label: tCommon("routes"), icon: Route },
    { id: "tags", label: tCommon("tags"), icon: Tag },
    { id: "activity", label: tMachine("activity"), icon: Activity },
  ];

  const handleDelete = () => {
    showConfirm({
      title: tCommon("delete"),
      description: t("deleteMachine", { name: machine.name || machine.givenName || tMachine("unnamed") }),
      confirmText: tCommon("delete"),
      cancelText: tCommon("cancel"),
      variant: "destructive",
      onConfirm: () => {
        deleteMachine.mutate(machine.id, {
          onSuccess: () => {
            window.location.href = `/${locale}/machines`;
          },
        });
      },
    });
  };

  const handleExpire = () => {
    showConfirm({
      title: tCommon("expire"),
      description: t("expireMachine", { name: machine.name || machine.givenName || tMachine("unnamed") }),
      confirmText: tCommon("expire"),
      cancelText: tCommon("cancel"),
      variant: "default",
      onConfirm: () => expireMachine.mutate(machine.id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/machines`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tMachine("back")}
            </Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              {machine.online ? (
                <Wifi className="h-8 w-8 text-green-500" />
              ) : (
                <WifiOff className="h-8 w-8 text-muted-foreground" />
              )}
              {machine.name || machine.givenName || tMachine("unnamed")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {tMachine("machineDetails")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsMoveOpen(true)}>
            {tCommon("move")}
          </Button>
          <Button variant="outline" onClick={() => setIsRoutesOpen(true)}>
            {tCommon("manageRoutes")}
          </Button>
          <Button variant="outline" onClick={() => setIsTagsOpen(true)}>
            {tCommon("manageTags")}
          </Button>
          <Button variant="outline" onClick={handleExpire}>
            {tCommon("expire")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{tMachine("basicInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{tMachine("status")}</p>
                <Badge variant={machine.online ? "default" : "secondary"}>
                  {machine.online ? tMachine("online") : tMachine("offline")}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tMachine("user")}</p>
                <p className="font-medium text-foreground">{machine.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {tMachine("registerMethod")}
                </p>
                <p className="font-medium text-foreground">{machine.registerMethod || tMachine("unknown")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tMachine("givenName")}</p>
                <p className="font-medium">{machine.givenName || tMachine("nA")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tMachine("network")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {tMachine("ipAddresses")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {machine.ipAddresses.map((ip) => (
                    <Badge key={ip} variant="info">
                      {ip}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {tMachine("approvedRoutes")}
                </p>
                <p className="font-medium text-foreground">
                  {tMachine("routesCount", { count: machine.approvedRoutes?.length || 0 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {tMachine("availableRoutes")}
                </p>
                <p className="font-medium text-foreground">
                  {tMachine("routesCount", { count: machine.availableRoutes?.length || 0 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {tMachine("subnetRoutes")}
                </p>
                <p className="font-medium">
                  {tMachine("routesCount", { count: machine.subnetRoutes?.length || 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{tMachine("routes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {machine.approvedRoutes && machine.approvedRoutes.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">{tMachine("approvedRoutes")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.approvedRoutes.map((route) => (
                      <Badge key={route} variant="default">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {machine.availableRoutes && machine.availableRoutes.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">{tMachine("availableRoutes")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.availableRoutes.map((route) => (
                      <Badge
                        key={route}
                        variant={
                          machine.approvedRoutes?.includes(route)
                            ? "default"
                            : "info"
                        }
                      >
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {machine.subnetRoutes && machine.subnetRoutes.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">{tMachine("subnetRoutes")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.subnetRoutes.map((route) => (
                      <Badge key={route} variant="default">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!machine.approvedRoutes ||
                machine.approvedRoutes.length === 0) &&
                (!machine.availableRoutes ||
                  machine.availableRoutes.length === 0) &&
                (!machine.subnetRoutes || machine.subnetRoutes.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    {tMachine("noRoutesConfigured")}
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{tCommon("tags")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {machine.validTags && machine.validTags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">{tMachine("validTags")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.validTags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {machine.forcedTags && machine.forcedTags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">{tMachine("forcedTags")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.forcedTags.map((tag) => (
                      <Badge key={tag} variant="info">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {machine.invalidTags && machine.invalidTags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-red-600 dark:text-red-400">
                    {tMachine("invalidTags")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.invalidTags.map((tag) => (
                      <Badge key={tag} variant="danger">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!machine.validTags || machine.validTags.length === 0) &&
                (!machine.forcedTags || machine.forcedTags.length === 0) &&
                (!machine.invalidTags || machine.invalidTags.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    {tMachine("noTagsAssigned")}
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{tMachine("timestamps")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{tMachine("created")}</p>
                <p className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDate(machine.createdAt)}
                </p>
              </div>
              {machine.lastSeen && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {tMachine("lastSeen")}
                  </p>
                  <p className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(machine.lastSeen)}
                  </p>
                </div>
              )}
              {machine.expiry && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {tMachine("expiry")}
                  </p>
                  <p className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(machine.expiry)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tMachine("keys")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {tMachine("machineKey")}
                </p>
                <code className="block truncate text-xs text-foreground">
                  {machine.machineKey.substring(0, 20)}...
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tMachine("nodeKey")}</p>
                <code className="block truncate text-xs text-foreground">
                  {machine.nodeKey.substring(0, 20)}...
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tMachine("discoKey")}</p>
                <code className="block truncate text-xs">
                  {machine.discoKey.substring(0, 20)}...
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>
      </Tabs>

      <MoveMachineModal
        open={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        machine={machine}
      />

      <ManageRoutesModal
        open={isRoutesOpen}
        onClose={() => setIsRoutesOpen(false)}
        machine={machine}
      />

      <ManageTagsModal
        open={isTagsOpen}
        onClose={() => setIsTagsOpen(false)}
        machine={machine}
      />

      {DialogComponent}
    </div>
  );
}

