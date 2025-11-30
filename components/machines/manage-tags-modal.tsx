"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useSetMachineTags } from "@/lib/hooks/use-machines";
import type { Machine } from "@/lib/api/types";

interface ManageTagsModalProps {
  open: boolean;
  onClose: () => void;
  machine: Machine | null;
}

export function ManageTagsModal({
  open,
  onClose,
  machine,
}: ManageTagsModalProps) {
  const t = useTranslations("components.modals.manageTags");
  const tCommon = useTranslations("common");
  const tMachine = useTranslations("pages.machines");
  const [tags, setTags] = useState(() => machine?.validTags || []);
  const [newTag, setNewTag] = useState("");
  const setTagsMutation = useSetMachineTags();

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (machine) {
      setTagsMutation.mutate(
        { machineId: machine.id, tags },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("title")} size="md">
      <div key={machine?.id} className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("machine")}: <span className="font-medium text-foreground">{machine?.name || tMachine("unnamed")}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t("addTag")}</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={t("enterTagName")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button onClick={addTag} disabled={!newTag.trim()}>
              {t("add")}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("tags")}</Label>
          {tags.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("noTagsAssigned")}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {machine && (machine.forcedTags?.length || 0) > 0 && (
          <div className="space-y-2">
            <Label>{t("forcedTags")}</Label>
            <div className="flex flex-wrap gap-2">
              {machine.forcedTags.map((tag) => (
                <Badge key={tag} variant="info">
                  {tag} ({t("forced")})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {machine && (machine.invalidTags?.length || 0) > 0 && (
          <div className="space-y-2">
            <Label className="text-destructive">
              {t("invalidTags")}
            </Label>
            <div className="flex flex-wrap gap-2">
              {machine.invalidTags.map((tag) => (
                <Badge key={tag} variant="danger">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              setTagsMutation.isPending ||
              JSON.stringify(tags.sort()) ===
                JSON.stringify((machine?.validTags || []).sort())
            }
          >
            {setTagsMutation.isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

