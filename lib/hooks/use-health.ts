"use client";

import { useQuery } from "@tanstack/react-query";
import { healthApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/contexts/auth-context";

export function useHealth() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["health"],
    queryFn: () => healthApi.get(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

