"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { apiKeysApi } from "@/lib/api/endpoints";
import type { CreateApiKeyRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/contexts/auth-context";

export function useApiKeys() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeysApi.list(),
    enabled: isAuthenticated,
  });
}

export function useCreateApiKey() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: CreateApiKeyRequest) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(t("toast.apiKeyCreated"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.apiKeyCreateFailed", { error: error.message }));
    },
  });
}

export function useExpireApiKey() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefix: string) => apiKeysApi.expire(prefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(t("toast.apiKeyExpired"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.apiKeyExpireFailed", { error: error.message }));
    },
  });
}

export function useDeleteApiKey() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefix: string) => apiKeysApi.delete(prefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(t("toast.apiKeyDeleted"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.apiKeyDeleteFailed", { error: error.message }));
    },
  });
}

