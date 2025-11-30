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

  const setExpirationFromDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 0, 0); // Set to end of day
    // Format as YYYY-MM-DDTHH:mm for DatePicker (DatePicker expects this format)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    setExpiration(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const handleCreate = () => {
    if (!user.trim()) return;
    if (!expiration.trim()) return;

    const aclTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Convert expiration to RFC3339 format (required by protobuf Timestamp)
    // DatePicker returns YYYY-MM-DDTHH:mm, we need YYYY-MM-DDTHH:mm:00Z
    const dateStr = expiration.trim();
    let formattedExpiration: string;
    
    // Validate format: YYYY-MM-DDTHH:mm
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) {
      // Append seconds and UTC timezone: YYYY-MM-DDTHH:mm:ssZ
      formattedExpiration = `${dateStr}:00Z`;
    } else {
      // Fallback: try parsing as Date and convert to ISO
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return; // Invalid date
      }
      formattedExpiration = date.toISOString();
    }

    createKey.mutate(
      {
        user: user.trim(),
        reusable,
        ephemeral,
        expiration: formattedExpiration,
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
            {t("expiration")} <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpirationFromDays(30)}
            >
              {t("expireIn30Days")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpirationFromDays(180)}
            >
              {t("expireIn180Days")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpirationFromDays(9999)}
            >
              {t("expireIn9999Days")}
            </Button>
          </div>
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
          <Button onClick={handleCreate} disabled={createKey.isPending || !expiration.trim()}>
            {createKey.isPending ? t("creating") : tCommon("create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

