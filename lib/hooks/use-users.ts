"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usersApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/contexts/auth-context";

export function useUsers() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
    enabled: isAuthenticated,
  });
}

export function useUser(userName: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["user", userName],
    queryFn: () => usersApi.get(userName),
    enabled: isAuthenticated && !!userName,
  });
}

export function useCreateUser() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userName: string) => usersApi.create(userName),
    onSuccess: (_, userName) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("toast.userCreated", { name: userName }));
    },
    onError: (error: Error) => {
      toast.error(t("toast.userCreateFailed", { error: error.message }));
    },
  });
}

export function useDeleteUser() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success(t("toast.userDeleted"));
    },
    onError: (error: Error) => {
      toast.error(t("toast.userDeleteFailed", { error: error.message }));
    },
  });
}

export function useRenameUser() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldId, newName }: { oldId: string; newName: string }) =>
      usersApi.rename(oldId, newName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success(t("toast.userRenamed", { name: variables.newName }));
    },
    onError: (error: Error) => {
      toast.error(t("toast.userRenameFailed", { error: error.message }));
    },
  });
}

