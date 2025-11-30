"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/lib/hooks/use-users";
import { useMoveMachine } from "@/lib/hooks/use-machines";
import type { Machine } from "@/lib/api/types";

interface MoveMachineModalProps {
  open: boolean;
  onClose: () => void;
  machine: Machine | null;
}

export function MoveMachineModal({
  open,
  onClose,
  machine,
}: MoveMachineModalProps) {
  const t = useTranslations("components.modals.moveMachine");
  const tCommon = useTranslations("common");
  const tMachine = useTranslations("pages.machines");
  const [selectedUser, setSelectedUser] = useState(() => 
    machine?.user.name || ""
  );
  const { data: users } = useUsers();
  const moveMachine = useMoveMachine();

  const handleMove = () => {
    if (machine && selectedUser && selectedUser !== machine.user.name) {
      // Find user ID from selected userName
      const user = users?.find((u) => u.name === selectedUser);
      if (user) {
        moveMachine.mutate(
          { machineId: machine.id, userId: user.id },
          {
            onSuccess: () => {
              onClose();
            },
          }
        );
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("title")} size="sm">
      <div key={machine?.id} className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("machine")}: <span className="font-medium text-foreground">{machine?.name || tMachine("unnamed")}</span>
          </p>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("currentUser")}: <span className="font-medium text-foreground">{machine?.user.name}</span>
          </p>
        </div>
        <div className="space-y-2">
          <Label>{t("moveToUser")}</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectUser")} />
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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              moveMachine.isPending ||
              !selectedUser ||
              selectedUser === machine?.user.name
            }
          >
            {moveMachine.isPending ? t("moving") : t("move")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

