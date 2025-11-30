"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { aclsApi } from "@/lib/api/endpoints";
import type { ACL } from "@/lib/api/types";
import { useAuth } from "@/lib/contexts/auth-context";

export function useACL() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["acl"],
    queryFn: () => aclsApi.get(),
    enabled: isAuthenticated,
  });
}

export function useUpdateACL() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (acl: ACL) => aclsApi.update(acl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acl"] });
      toast.success(t("toast.aclSaved"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.aclSaveFailed", { error: error.message }));
    },
  });
}

