"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Copy, Check, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePendingRegistrations, useExpirePreAuthKey } from "@/lib/hooks/use-preauth-keys";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { PreAuthKey } from "@/lib/api/types";

export function PendingRegistrations() {
  const t = useTranslations("pages.preauthKeys");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("components.confirm");
  const { data: pendingKeys, isPending, error } = usePendingRegistrations();
  const expireKey = useExpirePreAuthKey();
  const { showConfirm, DialogComponent } = useConfirmDialog();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [headscaleServerUrl, setHeadscaleServerUrl] = useState<string | null>(null);
  const [isMounted] = useState(() => typeof window !== "undefined");

  // Fetch server URL for registration links
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.serverUrl) {
          setHeadscaleServerUrl(data.serverUrl);
        }
      })
      .catch(() => {
        // If API fails, keep null
      });
  }, []);

  const handleExpire = (key: PreAuthKey) => {
    const user = typeof key.user === "object" ? key.user.name : key.user;
    showConfirm({
      title: t("expire"),
      description: tConfirm("expireKey"),
      confirmText: t("expire"),
      cancelText: tCommon("cancel"),
      variant: "default",
      onConfirm: () => expireKey.mutate({ key: key.key, user: user || "" }),
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyRegistrationUrl = (key: string) => {
    if (!headscaleServerUrl) return;
    const url = `${headscaleServerUrl}/register/${key}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(`url-${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyCommand = (key: string) => {
    const user = pendingKeys?.find((k) => k.key === key)?.user;
    const userName = typeof user === "object" ? user.name : user || "USERNAME";
    const command = `headscale nodes register --key ${key} --user ${userName}`;
    navigator.clipboard.writeText(command);
    setCopiedKey(`cmd-${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isMounted) {
    return null;
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {t("pendingRegistrations")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t("errorLoadingPending", { error: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  if (!pendingKeys || pendingKeys.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {t("pendingRegistrations")}
            <Badge variant="secondary" className="ml-2">
              {pendingKeys.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("pendingRegistrationsDesc")}
              </AlertDescription>
            </Alert>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("key")}</TableHead>
                    <TableHead>{tCommon("user")}</TableHead>
                    <TableHead>{t("created")}</TableHead>
                    <TableHead>{t("expiration")}</TableHead>
                    <TableHead className="text-right">{tCommon("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingKeys.map((key: PreAuthKey) => {
                    const user = typeof key.user === "object" ? key.user.name : key.user;
                    const registrationUrl = headscaleServerUrl
                      ? `${headscaleServerUrl}/register/${key.key}`
                      : null;

                    return (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs">
                              {key.key.substring(0, 20)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(key.key)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedKey === key.key ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex flex-col">
                            <span>{formatDate(key.createdAt)}</span>
                            <span className="text-xs">
                              {formatRelativeTime(key.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {key.expiration ? (
                            <div className="flex flex-col">
                              <span>{formatDate(key.expiration)}</span>
                              <span className="text-xs">
                                {formatRelativeTime(key.expiration)}
                              </span>
                            </div>
                          ) : (
                            <span>{t("never")}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {registrationUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyRegistrationUrl(key.key)}
                                className="h-8"
                              >
                                {copiedKey === `url-${key.key}` ? (
                                  <Check className="mr-2 h-3 w-3" />
                                ) : (
                                  <ExternalLink className="mr-2 h-3 w-3" />
                                )}
                                {t("copyUrl")}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyCommand(key.key)}
                              className="h-8"
                            >
                              {copiedKey === `cmd-${key.key}` ? (
                                <Check className="mr-2 h-3 w-3" />
                              ) : (
                                <Copy className="mr-2 h-3 w-3" />
                              )}
                              {t("copyCommand")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleExpire(key)}
                              className="h-8"
                            >
                              <Clock className="mr-2 h-3 w-3" />
                              {t("expire")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      {DialogComponent}
    </>
  );
}

