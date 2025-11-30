"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { routesApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/contexts/auth-context";

export function useRoutes() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["routes"],
    queryFn: () => routesApi.list(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useEnableRoute() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) => routesApi.enable(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(t("toast.routeEnabled"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.routeEnableFailed", { error: error.message }));
    },
  });
}

export function useDisableRoute() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) => routesApi.disable(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(t("toast.routeDisabled"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.routeDisableFailed", { error: error.message }));
    },
  });
}

export function useDeleteRoute() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) => routesApi.delete(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(t("toast.routeDeleted"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.routeDeleteFailed", { error: error.message }));
    },
  });
}

