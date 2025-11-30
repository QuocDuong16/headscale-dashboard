"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { aclsApi } from "@/lib/api/endpoints";
import type { ACL } from "@/lib/api/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { ApiError } from "@/lib/api/client";

export function useACL() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["acl"],
    queryFn: () => aclsApi.get(),
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry on 500 errors (server errors like file mode)
      if (error instanceof ApiError && error.status === 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
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
      // Check if error is about database mode requirement
      if (error.message.includes("update is disabled for modes other than 'database'") || 
          error.message.includes("database")) {
        toast.error(t("toast.databaseModeRequired"), {
          duration: 10000, // Show longer for important message
        });
      } else {
        toast.error(t("toast.aclSaveFailed", { error: error.message }));
      }
    },
  });
}

