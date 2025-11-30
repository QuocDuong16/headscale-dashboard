"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Power, PowerOff, Trash2, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoutes, useEnableRoute, useDisableRoute, useDeleteRoute } from "@/lib/hooks/use-routes";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { formatDate } from "@/lib/utils/format";
import type { Route } from "@/lib/api/types";

export function RouteList() {
  const t = useTranslations("components.confirm");
  const tCommon = useTranslations("common");
  const tRoute = useTranslations("pages.routes");
  const { data: routes, isPending, error } = useRoutes();
  const [isMounted] = useState(() => typeof window !== "undefined");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all");
  const enableRoute = useEnableRoute();
  const disableRoute = useDisableRoute();
  const deleteRoute = useDeleteRoute();
  const { showConfirm, DialogComponent } = useConfirmDialog();

  const filteredRoutes =
    routes?.filter(
      (route: Route) => {
        const matchesSearch =
          route.prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.machine.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.machine.user.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "enabled" && route.enabled) ||
          (statusFilter === "disabled" && !route.enabled);
        
        return matchesSearch && matchesStatus;
      }
    ) || [];

  const handleToggle = (route: Route) => {
    if (route.enabled) {
      disableRoute.mutate(route.id);
    } else {
      enableRoute.mutate(route.id);
    }
  };

  const handleDelete = (route: Route) => {
    showConfirm({
      title: tCommon("delete"),
      description: t("deleteRoute", { prefix: route.prefix }),
      confirmText: tCommon("delete"),
      cancelText: tCommon("cancel"),
      variant: "destructive",
      onConfirm: () => deleteRoute.mutate(route.id),
    });
  };

  if (!isMounted || isPending) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tRoute("prefix")}</TableHead>
                <TableHead>{tRoute("machine")}</TableHead>
                <TableHead>{tRoute("user")}</TableHead>
                <TableHead>{tRoute("status")}</TableHead>
                <TableHead>{tCommon("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
          <AlertDescription>
            {tRoute("errorLoading", { error: error.message })}
          </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tRoute("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "enabled" | "disabled")
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={tRoute("statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tRoute("allStatus")}</SelectItem>
              <SelectItem value="enabled">{tRoute("enabled")}</SelectItem>
              <SelectItem value="disabled">{tRoute("disabled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {tRoute("routesCount", { count: filteredRoutes.length, plural: filteredRoutes.length !== 1 ? "s" : "" })}
        </div>
      </div>

      {filteredRoutes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? tRoute("noRoutesMatching")
                : tRoute("noRoutesFound")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tRoute("prefix")}</TableHead>
                  <TableHead>{tRoute("machine")}</TableHead>
                  <TableHead>{tRoute("user")}</TableHead>
                  <TableHead>{tRoute("status")}</TableHead>
                  <TableHead>{tRoute("advertised")}</TableHead>
                  <TableHead>{tRoute("primary")}</TableHead>
                  <TableHead>{tRoute("created")}</TableHead>
                  <TableHead className="text-right">{tCommon("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route: Route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-mono">{route.prefix}</TableCell>
                    <TableCell>{route.machine.name || tRoute("unnamed")}</TableCell>
                    <TableCell>{route.machine.user.name}</TableCell>
                    <TableCell>
                      <Badge variant={route.enabled ? "default" : "secondary"}>
                        {route.enabled ? tRoute("enabled") : tRoute("disabled")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.advertised ? "info" : "secondary"}>
                        {route.advertised ? tRoute("yes") : tRoute("no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.isPrimary ? "default" : "secondary"}>
                        {route.isPrimary ? tRoute("yes") : tRoute("no")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(route.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(route)}
                          disabled={
                            enableRoute.isPending || disableRoute.isPending
                          }
                        >
                          {route.enabled ? (
                            <>
                              <PowerOff className="mr-2 h-4 w-4" />
                              {tRoute("disable")}
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" />
                              {tRoute("enable")}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(route)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {tCommon("delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {DialogComponent}
    </div>
  );
}

