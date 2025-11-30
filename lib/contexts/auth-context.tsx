"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthToken, setOnTokenInvalidCallback } from "@/lib/api/client";
import { TokenRequiredModal } from "@/components/ui/token-required-modal";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "headscale-auth-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const prevTokenRef = useRef<string | null>(null);
  
  // Initialize state from localStorage synchronously to avoid setState in effect
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        setAuthToken(storedToken);
        return storedToken;
      }
    }
    return null;
  });

  // Initialize prevTokenRef after mount to avoid accessing refs during render
  useEffect(() => {
    if (token && prevTokenRef.current === null) {
      prevTokenRef.current = token;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to initialize ref

  // Clear queries when logging out
  useEffect(() => {
    const wasAuthenticated = !!prevTokenRef.current;
    const isAuthenticated = !!token;
    
    if (wasAuthenticated && !isAuthenticated) {
      // Just logged out - clear all queries
      queryClient.clear();
    }
    
    prevTokenRef.current = token;
  }, [token, queryClient]);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    setAuthToken(newToken);
    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  // Handle token invalid (401 error)
  const handleTokenInvalid = useCallback(() => {
    setToken(null);
  }, [setToken]);

  // Register callback for token invalidation
  useEffect(() => {
    setOnTokenInvalidCallback(handleTokenInvalid);
    return () => {
      setOnTokenInvalidCallback(null);
    };
  }, [handleTokenInvalid]);

  const handleTokenValid = useCallback((newToken: string) => {
    setToken(newToken);
  }, [setToken]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isAuthenticated: !!token,
      }}
    >
      {children}
      <TokenRequiredModal 
        open={!token} 
        onTokenValid={handleTokenValid}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

