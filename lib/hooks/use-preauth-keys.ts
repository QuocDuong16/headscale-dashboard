"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { preAuthKeysApi } from "@/lib/api/endpoints";
import type { CreatePreAuthKeyRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/contexts/auth-context";

export function usePreAuthKeys(userName: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["preauth-keys", userName],
    queryFn: () => preAuthKeysApi.list(userName),
    enabled: isAuthenticated && !!userName,
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
      toast.success(t("toast.preauthKeyExpired"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.preauthKeyExpireFailed", { error: error.message }));
    },
  });
}

