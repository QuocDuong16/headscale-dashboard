"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Trash2,
  Edit2,
  Clock,
  Wifi,
  WifiOff,
  Move,
  Route,
  Tag,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Machine } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  useDeleteMachine,
  useRenameMachine,
  useExpireMachine,
} from "@/lib/hooks/use-machines";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { MoveMachineModal } from "./move-machine-modal";
import { ManageRoutesModal } from "./manage-routes-modal";
import { ManageTagsModal } from "./manage-tags-modal";

interface MachineCardProps {
  machine: Machine;
}

export function MachineCard({ machine }: MachineCardProps) {
  const t = useTranslations("components.confirm");
  const tCard = useTranslations("components.machineCard");
  const tCommon = useTranslations("common");
  const tMachine = useTranslations("pages.machines");
  const locale = useLocale();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isRoutesOpen, setIsRoutesOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [newName, setNewName] = useState(machine.name);
  const deleteMachine = useDeleteMachine();
  const renameMachine = useRenameMachine();
  const expireMachine = useExpireMachine();
  const { showConfirm, DialogComponent } = useConfirmDialog();

  const handleRename = () => {
    renameMachine.mutate(
      { machineId: machine.id, name: newName },
      {
        onSuccess: () => {
          setIsRenameOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    showConfirm({
      title: tCommon("delete"),
      description: t("deleteMachine", { name: machine.name || machine.givenName || tMachine("unnamed") }),
      confirmText: tCommon("delete"),
      cancelText: tCommon("cancel"),
      variant: "destructive",
      onConfirm: () => deleteMachine.mutate(machine.id),
    });
  };

  const handleExpire = () => {
    showConfirm({
      title: tCommon("expire"),
      description: t("expireMachine", { name: machine.name || machine.givenName || tMachine("unnamed") }),
      confirmText: tCommon("expire"),
      cancelText: tCommon("cancel"),
      variant: "default",
      onConfirm: () => expireMachine.mutate(machine.id),
    });
  };

  return (
    <>
      <Card className="card-hover animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {machine.online ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-muted-foreground" />
              )}
              <Link
                href={`/${locale}/machines/${machine.id}`}
                className="hover:text-primary transition-colors"
              >
                {machine.name || machine.givenName || tMachine("unnamed")}
              </Link>
              <Link href={`/${locale}/machines/${machine.id}`}>
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={machine.online ? "default" : "secondary"}>
                {machine.online ? tCommon("connected") : tCommon("disconnected")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{tCard("user")}</p>
              <p className="font-medium text-foreground">{machine.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {tCard("ipAddresses")}
              </p>
              <div className="flex flex-wrap gap-2">
                {machine.ipAddresses.map((ip) => (
                  <Badge key={ip} variant="info">
                    {ip}
                  </Badge>
                ))}
              </div>
            </div>
            {machine.lastSeen && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {tCard("lastSeen")}
                </p>
                <p className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {formatRelativeTime(machine.lastSeen)}
                </p>
              </div>
            )}
            {(machine.validTags?.length || 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">{tCard("tags")}</p>
                <div className="flex flex-wrap gap-2">
                  {machine.validTags?.map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRenameOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRoutesOpen(true)}
                >
                  <Route className="h-4 w-4" />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsMoveOpen(true)}>
                    <Move className="mr-2 h-4 w-4" />
                    {tCard("move")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsTagsOpen(true)}>
                    <Tag className="mr-2 h-4 w-4" />
                    {tCard("manageTags")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExpire}>
                    <Clock className="mr-2 h-4 w-4" />
                    {tCard("expire")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tCard("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title={tCard("renameMachine")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tCard("newName")}</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={tCard("enterNewName")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleRename} disabled={renameMachine.isPending}>
              {renameMachine.isPending ? tCard("saving") : tCommon("save")}
            </Button>
          </div>
        </div>
      </Modal>

      <MoveMachineModal
        open={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        machine={machine}
      />

      <ManageRoutesModal
        open={isRoutesOpen}
        onClose={() => setIsRoutesOpen(false)}
        machine={machine}
      />

      <ManageTagsModal
        open={isTagsOpen}
        onClose={() => setIsTagsOpen(false)}
        machine={machine}
      />

      {DialogComponent}
    </>
  );
}

