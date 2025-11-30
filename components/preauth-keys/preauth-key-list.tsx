"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Clock, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { useUsers } from "@/lib/hooks/use-users";
import { usePreAuthKeys, useExpirePreAuthKey } from "@/lib/hooks/use-preauth-keys";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { CreateKeyModal } from "./create-key-modal";
import { formatDate } from "@/lib/utils/format";
import type { PreAuthKey } from "@/lib/api/types";

export function PreAuthKeyList() {
  const t = useTranslations("components.confirm");
  const tCommon = useTranslations("common");
  const tPreAuth = useTranslations("pages.preauthKeys");
  const { data: users } = useUsers();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: keys, isPending, error } = usePreAuthKeys(
    selectedUser || users?.[0]?.name || ""
  );
  const [isMounted] = useState(() => typeof window !== "undefined");
  const expireKey = useExpirePreAuthKey();
  const { showConfirm, DialogComponent } = useConfirmDialog();

  const handleExpire = (key: PreAuthKey) => {
    const user = typeof key.user === "object" ? key.user.name : key.user;
    showConfirm({
      title: tPreAuth("expire"),
      description: t("expireKey"),
      confirmText: tPreAuth("expire"),
      cancelText: tCommon("cancel"),
      variant: "default",
      onConfirm: () => expireKey.mutate({ key: key.key, user: user || selectedUser || users?.[0]?.name || "" }),
    });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isMounted || isPending) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tPreAuth("key")}</TableHead>
                <TableHead>{tPreAuth("reusable")}</TableHead>
                <TableHead>{tPreAuth("expiration")}</TableHead>
                <TableHead>{tCommon("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
          {tPreAuth("errorLoading", { error: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Label htmlFor="user-select">{tCommon("user")}:</Label>
          <Select
            value={selectedUser || users?.[0]?.name || ""}
            onValueChange={setSelectedUser}
          >
            <SelectTrigger id="user-select" className="w-[200px]">
              <SelectValue placeholder={tCommon("selectUser")} />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.name}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {tPreAuth("createKey")}
        </Button>
      </div>

      {!keys || keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {tPreAuth("noKeysFound")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tPreAuth("key")}</TableHead>
                  <TableHead>{tPreAuth("reusable")}</TableHead>
                  <TableHead>{tPreAuth("ephemeral")}</TableHead>
                  <TableHead>{tPreAuth("used")}</TableHead>
                  <TableHead>{tPreAuth("expiration")}</TableHead>
                  <TableHead>{tCommon("tags")}</TableHead>
                  <TableHead>{tPreAuth("created")}</TableHead>
                  <TableHead className="text-right">{tCommon("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key: PreAuthKey) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs">
                          {key.key.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(key.key)}
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
                      <Badge variant={key.reusable ? "default" : "secondary"}>
                        {key.reusable ? tPreAuth("yes") : tPreAuth("no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.ephemeral ? "info" : "secondary"}>
                        {key.ephemeral ? tPreAuth("yes") : tPreAuth("no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.used ? "info" : "secondary"}>
                        {key.used ? tPreAuth("yes") : tPreAuth("no")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.expiration ? formatDate(key.expiration) : tPreAuth("never")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.aclTags?.map((tag) => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(!key.aclTags || key.aclTags.length === 0) && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExpire(key)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {tPreAuth("expire")}
                      </Button>
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
        selectedUser={selectedUser || users?.[0]?.name || ""}
      />

      {DialogComponent}
    </div>
  );
}

