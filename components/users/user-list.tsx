"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Edit2, Search, Filter, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useUsers, useCreateUser, useDeleteUser, useRenameUser } from "@/lib/hooks/use-users";
import { useMachines } from "@/lib/hooks/use-machines";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/lib/api/types";

type SortField = "name" | "createdAt" | "machineCount";

export function UserList() {
  const t = useTranslations("components.confirm");
  const tCommon = useTranslations("common");
  const tUser = useTranslations("pages.users");
  const { data: users, isPending, error } = useUsers();
  const { data: machines } = useMachines();
  const [isMounted] = useState(() => typeof window !== "undefined");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [renameValue, setRenameValue] = useState("");

  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const renameUser = useRenameUser();
  const { showConfirm, DialogComponent } = useConfirmDialog();

  const filteredAndSortedUsers = useMemo(() => {
    const getUserMachineCount = (userName: string) => {
      return machines?.filter((m) => m.user.name === userName).length || 0;
    };

    const filtered = users?.filter((user: User) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "machineCount":
          aValue = getUserMachineCount(a.name);
          bValue = getUserMachineCount(b.name);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, sortField, sortOrder, machines]);

  const getUserMachineCount = (userName: string) => {
    return machines?.filter((m) => m.user.name === userName).length || 0;
  };

  const handleCreate = () => {
    if (newUserName.trim()) {
      createUser.mutate(newUserName.trim(), {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewUserName("");
        },
      });
    }
  };

  const handleRename = () => {
    if (selectedUser && renameValue.trim()) {
      renameUser.mutate(
        { oldId: selectedUser.id, newName: renameValue.trim() },
        {
          onSuccess: () => {
            setIsRenameOpen(false);
            setSelectedUser(null);
            setRenameValue("");
          },
        }
      );
    }
  };

  const handleDelete = (user: User) => {
    showConfirm({
      title: tCommon("delete"),
      description: t("deleteUser", { name: user.name }),
      confirmText: tCommon("delete"),
      cancelText: tCommon("cancel"),
      variant: "destructive",
      onConfirm: () => deleteUser.mutate(user.id),
    });
  };

  const openRenameModal = (user: User) => {
    setSelectedUser(user);
    setRenameValue(user.name);
    setIsRenameOpen(true);
  };

  // Only show loading state after component has mounted on client
  // This prevents hydration mismatch between server and client
  if (!isMounted || isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {tUser("errorLoadingUsers", { error: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tUser("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={`${sortField}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-");
              setSortField(field as SortField);
              setSortOrder(order as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={tUser("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{tUser("nameAsc")}</SelectItem>
              <SelectItem value="name-desc">{tUser("nameDesc")}</SelectItem>
              <SelectItem value="createdAt-desc">{tUser("createdNewest")}</SelectItem>
              <SelectItem value="createdAt-asc">{tUser("createdOldest")}</SelectItem>
              <SelectItem value="machineCount-desc">{tUser("machineCountMost")}</SelectItem>
              <SelectItem value="machineCount-asc">{tUser("machineCountLeast")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {tUser("createUser")}
        </Button>
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? tUser("noUsersFoundSearch")
                : tUser("noUsersFound")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedUsers.map((user: User) => (
            <Card key={user.id} className="card-hover animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{user.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {tUser("created")}
                    </p>
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {getUserMachineCount(user.name)} {tCommon("machines").toLowerCase()}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openRenameModal(user)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          {tUser("renameUser")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {tCommon("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={tUser("createUser")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tUser("userName")}</Label>
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder={tUser("enterUserName")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setNewUserName("");
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={createUser.isPending}>
              {createUser.isPending ? tUser("creating") : tUser("create")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setSelectedUser(null);
          setRenameValue("");
        }}
        title={tUser("renameUser")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tUser("newName")}</Label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={tUser("enterNewName")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameOpen(false);
                setSelectedUser(null);
                setRenameValue("");
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleRename} disabled={renameUser.isPending}>
              {renameUser.isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </div>
        </div>
      </Modal>

      {DialogComponent}
    </div>
  );
}

