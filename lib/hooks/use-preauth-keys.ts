"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { preAuthKeysApi } from "@/lib/api/endpoints";
import type { CreatePreAuthKeyRequest, PreAuthKey } from "@/lib/api/types";
import { useAuth } from "@/lib/contexts/auth-context";

export function usePreAuthKeys(userName: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["preauth-keys", userName],
    queryFn: () => preAuthKeysApi.list(userName),
    enabled: isAuthenticated && !!userName,
  });
}

export function usePendingRegistrations() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["pending-registrations"],
    queryFn: async () => {
      const allKeys = await preAuthKeysApi.listAll();
      // Filter keys that are unused and not expired
      return allKeys.filter((key: PreAuthKey) => {
        if (key.used) return false;
        if (key.expiration) {
          const expirationDate = new Date(key.expiration);
          return expirationDate > new Date();
        }
        return true;
      });
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useCreatePreAuthKey() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePreAuthKeyRequest) => preAuthKeysApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["preauth-keys", variables.user],
      });
      queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
      toast.success(t("toast.preauthKeyCreated"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.preauthKeyCreateFailed", { error: error.message }));
    },
  });
}

export function useExpirePreAuthKey() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, user }: { key: string; user: string }) => 
      preAuthKeysApi.expire(key, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preauth-keys"] });
      queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
      toast.success(t("toast.preauthKeyExpired"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.preauthKeyExpireFailed", { error: error.message }));
    },
  });
}

