"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreatePreAuthKey } from "@/lib/hooks/use-preauth-keys";
import { useUsers } from "@/lib/hooks/use-users";

interface CreateKeyModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: string;
}

export function CreateKeyModal({
  open,
  onClose,
  selectedUser,
}: CreateKeyModalProps) {
  const t = useTranslations("pages.preauthKeys");
  const tCommon = useTranslations("common");
  const { data: users } = useUsers();
  const createKey = useCreatePreAuthKey();
  const [user, setUser] = useState(selectedUser);
  const [reusable, setReusable] = useState(true);
  const [ephemeral, setEphemeral] = useState(false);
  const [expiration, setExpiration] = useState("");
  const [tags, setTags] = useState("");

  const handleCreate = () => {
    if (!user.trim()) return;

    const aclTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createKey.mutate(
      {
        user: user.trim(),
        reusable,
        ephemeral,
        expiration: expiration || undefined,
        aclTags: aclTags.length > 0 ? aclTags : undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setUser(selectedUser);
          setReusable(true);
          setEphemeral(false);
          setExpiration("");
          setTags("");
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={t("createKeyModal")} size="md">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-select">{tCommon("user")}</Label>
          <Select value={user} onValueChange={setUser}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder={tCommon("selectUser")} />
            </SelectTrigger>
            <SelectContent>
              {users?.map((u) => (
                <SelectItem key={u.id} value={u.name}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="reusable"
            checked={reusable}
            onChange={(e) => setReusable(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <Label htmlFor="reusable" className="cursor-pointer">
            {t("reusable")}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ephemeral"
            checked={ephemeral}
            onChange={(e) => setEphemeral(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <Label htmlFor="ephemeral" className="cursor-pointer">
            {t("ephemeral")}
          </Label>
        </div>

        <div className="space-y-2">
          <Label>
            {t("expirationOptional")}
          </Label>
          <DatePicker
            value={expiration}
            onChange={setExpiration}
            placeholder={t("selectExpirationDate")}
            showTime={true}
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t("aclTagsOptional")}
          </Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t("aclTagsPlaceholder")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={createKey.isPending}>
            {createKey.isPending ? t("creating") : tCommon("create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

