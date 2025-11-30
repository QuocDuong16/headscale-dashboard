"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Clock, Search, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApiKeys, useExpireApiKey, useDeleteApiKey } from "@/lib/hooks/use-api-keys";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { CreateKeyModal } from "./create-key-modal";
import { formatDate } from "@/lib/utils/format";
import type { ApiKey } from "@/lib/api/types";

// Helper function to check if a date string is valid
function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  // Check if date is valid and not a default/invalid date (like year 1)
  return !isNaN(date.getTime()) && date.getFullYear() > 1900;
}

export function ApiKeyList() {
  const t = useTranslations("components.confirm");
  const tCommon = useTranslations("common");
  const tApiKey = useTranslations("pages.apiKeys");
  const { data: keys, isPending, error } = useApiKeys();
  const [isMounted] = useState(() => typeof window !== "undefined");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedPrefix, setCopiedPrefix] = useState<string | null>(null);
  const expireKey = useExpireApiKey();
  const deleteKey = useDeleteApiKey();
  const { showConfirm, DialogComponent } = useConfirmDialog();

  const filteredKeys =
    keys?.filter((key: ApiKey) =>
      key.prefix.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleExpire = (prefix: string) => {
    showConfirm({
      title: tApiKey("expire"),
      description: t("expireApiKey", { prefix }),
      confirmText: tApiKey("expire"),
      cancelText: tCommon("cancel"),
      variant: "default",
      onConfirm: () => expireKey.mutate(prefix),
    });
  };

  const handleDelete = (prefix: string) => {
    showConfirm({
      title: tCommon("delete"),
      description: t("deleteApiKey", { prefix }),
      confirmText: tCommon("delete"),
      cancelText: tCommon("cancel"),
      variant: "destructive",
      onConfirm: () => deleteKey.mutate(prefix),
    });
  };

  const handleCopy = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedPrefix(prefix);
    setTimeout(() => setCopiedPrefix(null), 2000);
  };

  if (!isMounted || isPending) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tApiKey("prefix")}</TableHead>
                <TableHead>{tApiKey("expiration")}</TableHead>
                <TableHead>{tApiKey("created")}</TableHead>
                <TableHead>{tCommon("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {tApiKey("errorLoading", { error: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tApiKey("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {tApiKey("createKey")}
        </Button>
      </div>

      {filteredKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? tApiKey("noKeysMatching")
                : tApiKey("noKeysFound")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{tApiKey("title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tApiKey("prefix")}</TableHead>
                  <TableHead>{tApiKey("expiration")}</TableHead>
                  <TableHead>{tApiKey("created")}</TableHead>
                  <TableHead>{tApiKey("lastSeen")}</TableHead>
                  <TableHead className="text-right">{tCommon("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map((key: ApiKey) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm">{key.prefix}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(key.prefix)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedPrefix === key.prefix ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.expiration && isValidDate(key.expiration) ? (
                        <Badge variant="default">
                          {formatDate(key.expiration)}
                        </Badge>
                      ) : (
                        <Badge variant="default">{tApiKey("never")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastSeen ? formatDate(key.lastSeen) : tApiKey("never")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExpire(key.prefix)}
                          disabled={expireKey.isPending || deleteKey.isPending}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {tApiKey("expire")}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(key.prefix)}
                          disabled={expireKey.isPending || deleteKey.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {tCommon("delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateKeyModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {DialogComponent}
    </div>
  );
}

