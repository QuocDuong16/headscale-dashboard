"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useSetApprovedRoutes } from "@/lib/hooks/use-machines";
import type { Machine } from "@/lib/api/types";

interface ManageRoutesModalProps {
  open: boolean;
  onClose: () => void;
  machine: Machine | null;
}

export function ManageRoutesModal({
  open,
  onClose,
  machine,
}: ManageRoutesModalProps) {
  const t = useTranslations("components.modals.manageRoutes");
  const tCommon = useTranslations("common");
  const tMachine = useTranslations("pages.machines");
  const [approvedRoutes, setApprovedRoutes] = useState(() => 
    machine?.approvedRoutes || []
  );
  const setApprovedRoutesMutation = useSetApprovedRoutes();

  const toggleRoute = (route: string) => {
    if (approvedRoutes.includes(route)) {
      setApprovedRoutes(approvedRoutes.filter((r) => r !== route));
    } else {
      setApprovedRoutes([...approvedRoutes, route]);
    }
  };

  const handleSave = () => {
    if (machine) {
      setApprovedRoutesMutation.mutate(
        { machineId: machine.id, routes: approvedRoutes },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const availableRoutes = machine?.availableRoutes || [];
  const subnetRoutes = machine?.subnetRoutes || [];
  const allRoutes = [...new Set([...availableRoutes, ...subnetRoutes])];

  return (
    <Modal open={open} onClose={onClose} title={t("title")} size="md">
      <div key={machine?.id} className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("machine")}: <span className="font-medium text-foreground">{machine?.name || tMachine("unnamed")}</span>
          </p>
        </div>

        {allRoutes.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("noRoutesAvailable")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>{t("availableRoutes")}</Label>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-3">
              {allRoutes.map((route) => {
                const isApproved = approvedRoutes.includes(route);
                const isAvailable = availableRoutes.includes(route);
                const isSubnet = subnetRoutes.includes(route);

                return (
                  <div
                    key={route}
                    className="flex items-center justify-between rounded-lg border border-border p-2 bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm text-foreground">{route}</code>
                      {isAvailable && (
                        <Badge variant="info" className="text-xs">
                          {t("available")}
                        </Badge>
                      )}
                      {isSubnet && (
                        <Badge variant="default" className="text-xs">
                          {t("subnet")}
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => toggleRoute(route)}
                      className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                        isApproved
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "border border-input hover:bg-accent"
                      }`}
                    >
                      {isApproved ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("routesApproved", { approved: approvedRoutes.length, total: allRoutes.length })}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              setApprovedRoutesMutation.isPending ||
              JSON.stringify(approvedRoutes.sort()) ===
                JSON.stringify((machine?.approvedRoutes || []).sort())
            }
          >
            {setApprovedRoutesMutation.isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

