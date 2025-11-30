"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMachines } from "@/lib/hooks/use-machines";
import { MachineCard } from "./machine-card";
import type { Machine } from "@/lib/api/types";

type SortField = "name" | "lastSeen" | "createdAt" | "user";
type SortOrder = "asc" | "desc";

export function MachineList() {
  const tMachine = useTranslations("pages.machines");
  const { data: machines, isPending, error } = useMachines();
  const [isMounted] = useState(() => typeof window !== "undefined");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const users = useMemo(() => {
    const uniqueUsers = new Set(machines?.map((m) => m.user.name) || []);
    return Array.from(uniqueUsers).sort();
  }, [machines]);

  const filteredAndSortedMachines = useMemo(() => {
    const filtered = machines?.filter(
      (machine: Machine) => {
        const matchesSearch =
          machine.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          machine.givenName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          machine.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          machine.ipAddresses.some((ip) =>
            ip.toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "online" && machine.online) ||
          (statusFilter === "offline" && !machine.online);
        
        const matchesUser = userFilter === "all" || machine.user.name === userFilter;
        
        return matchesSearch && matchesStatus && matchesUser;
      }
    ) || [];

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name || a.givenName || "";
          bValue = b.name || b.givenName || "";
          break;
        case "lastSeen":
          aValue = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          bValue = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "user":
          aValue = a.user.name;
          bValue = b.user.name;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [machines, searchQuery, statusFilter, userFilter, sortField, sortOrder]);

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
              <Skeleton className="h-4 w-32 mb-2" />
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
          {tMachine("errorLoadingMachines", { error: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tMachine("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {tMachine("machinesCount", { 
            count: filteredAndSortedMachines.length, 
            plural: filteredAndSortedMachines.length !== 1 ? "s" : "" 
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as "all" | "online" | "offline")
          }
        >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={tMachine("statusPlaceholder")} />
            </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tMachine("allStatus")}</SelectItem>
            <SelectItem value="online">{tMachine("online")}</SelectItem>
            <SelectItem value="offline">{tMachine("offline")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={tMachine("userPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tMachine("allUsers")}</SelectItem>
            {users.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={`${sortField}-${sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split("-");
            setSortField(field as SortField);
            setSortOrder(order as SortOrder);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={tMachine("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">{tMachine("nameAsc")}</SelectItem>
            <SelectItem value="name-desc">{tMachine("nameDesc")}</SelectItem>
            <SelectItem value="lastSeen-desc">{tMachine("lastSeenRecent")}</SelectItem>
            <SelectItem value="lastSeen-asc">{tMachine("lastSeenOldest")}</SelectItem>
            <SelectItem value="createdAt-desc">{tMachine("createdNewest")}</SelectItem>
            <SelectItem value="createdAt-asc">{tMachine("createdOldest")}</SelectItem>
            <SelectItem value="user-asc">{tMachine("userAsc")}</SelectItem>
            <SelectItem value="user-desc">{tMachine("userDesc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAndSortedMachines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? tMachine("noMachinesFoundSearch")
                : tMachine("noMachinesFound")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMachines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}

