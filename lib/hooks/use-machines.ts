"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { machinesApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/contexts/auth-context";

export function useMachines() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["machines"],
    queryFn: () => machinesApi.list(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMachine(machineId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["machine", machineId],
    queryFn: () => machinesApi.get(machineId),
    enabled: isAuthenticated && !!machineId,
  });
}

export function useDeleteMachine() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (machineId: string) => machinesApi.delete(machineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success(t("toast.machineDeleted"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.machineDeleteFailed", { error: error.message }));
    },
  });
}

export function useRenameMachine() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ machineId, name }: { machineId: string; name: string }) =>
      machinesApi.rename(machineId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["machine", variables.machineId] });
      toast.success(t("toast.machineRenamed", { name: variables.name }));
    },
    onError: (error: Error) => {
      toast.error(t("toast.machineRenameFailed", { error: error.message }));
    },
  });
}

export function useExpireMachine() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (machineId: string) => machinesApi.expire(machineId),
    onSuccess: (_, machineId) => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["machine", machineId] });
      toast.success(t("toast.machineExpired"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.machineExpireFailed", { error: error.message }));
    },
  });
}

export function useSetMachineTags() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ machineId, tags }: { machineId: string; tags: string[] }) =>
      machinesApi.setTags(machineId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success(t("toast.machineTagsUpdated"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.machineTagsUpdateFailed", { error: error.message }));
    },
  });
}

export function useMoveMachine() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      machineId,
      userId,
    }: {
      machineId: string;
      userId: string;
    }) => machinesApi.move(machineId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("toast.machineMoved"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.machineMoveFailed", { error: error.message }));
    },
  });
}

export function useSetApprovedRoutes() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      machineId,
      routes,
    }: {
      machineId: string;
      routes: string[];
    }) => machinesApi.setApprovedRoutes(machineId, routes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(t("toast.routesUpdated"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.routesUpdateFailed", { error: error.message }));
    },
  });
}

export function useBackfillIPs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmed?: boolean) => machinesApi.backfillIPs(confirmed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

