"use client";

import { useState, useRef, useEffect, useLayoutEffect, startTransition } from "react";
import { useTranslations } from "next-intl";
import { Save, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useACL, useUpdateACL } from "@/lib/hooks/use-acls";
import type { ACL } from "@/lib/api/types";

const DEFAULT_EMPTY_ACL: ACL = {
  groups: {},
  hosts: {},
  acls: [],
  tests: [],
};

export function ACLEditor() {
  const t = useTranslations("components.aclEditor");
  const { data: acl, isPending, error } = useACL();
  const updateACL = useUpdateACL();
  const isEmptyPolicy = acl && Object.keys(acl).length === 0;
  const userModifiedRef = useRef(false);
  const [previousAcl, setPreviousAcl] = useState<ACL | undefined>(acl);
  const [mounted, setMounted] = useState(false);
  
  // Track mount state to avoid hydration mismatch
  // Using useLayoutEffect with startTransition to avoid cascading renders
  useLayoutEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);
  
  const getJsonValue = (policy: ACL | undefined) => {
    if (!policy || Object.keys(policy).length === 0) {
      return JSON.stringify(DEFAULT_EMPTY_ACL, null, 2);
    }
    return JSON.stringify(policy, null, 2);
  };
  
  const [jsonValue, setJsonValue] = useState(() => getJsonValue(acl));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Update jsonValue when acl changes from server (only if user hasn't modified it)
  // Using startTransition to make the update non-blocking and avoid cascading renders
  useEffect(() => {
    if (acl !== undefined && acl !== previousAcl && !userModifiedRef.current) {
      startTransition(() => {
        setJsonValue(getJsonValue(acl));
        setPreviousAcl(acl);
      });
    }
  }, [acl, previousAcl]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonError(null);
      updateACL.mutate(parsed, {
        onSuccess: () => {
          // Update jsonValue after successful save
          setJsonValue(JSON.stringify(parsed, null, 2));
          userModifiedRef.current = false;
          setPreviousAcl(parsed);
        },
      });
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : t("invalidJson"));
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonValue(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : t("invalidJson"));
    }
  };

  // Show loading state only after mount to avoid hydration mismatch
  if (mounted && isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show error state only after mount to avoid hydration mismatch
  if (mounted && error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("errorLoading", { error: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEmptyPolicy && (
              <Alert variant="default" className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  {t("policyNotConfigured")}
                </AlertDescription>
              </Alert>
            )}
            {jsonError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{jsonError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleFormat}>
                {t("formatJson")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateACL.isPending || !!jsonError}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateACL.isPending ? t("saving") : t("saveChanges")}
              </Button>
            </div>
            <textarea
              value={jsonValue}
              onChange={(e) => {
                setJsonValue(e.target.value);
                setJsonError(null);
                userModifiedRef.current = true;
              }}
              className="min-h-[600px] w-full rounded-md border border-input bg-background p-4 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              spellCheck={false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
