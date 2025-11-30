"use client";

import { useTranslations } from "next-intl";
import { MachineList } from "@/components/machines/machine-list";
import { GuideCard } from "@/components/ui/guide-card";
import { Server } from "lucide-react";

export default function MachinesPage() {
  const t = useTranslations("pages.machines");
  const tCommon = useTranslations("common");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("description")}
        </p>
      </div>
      
      <GuideCard
        title={t("guideTitle")}
        description={t("guideDesc")}
        icon={<Server className="h-5 w-5 text-primary" />}
        sections={[
          {
            title: t("whatAreMachines"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("whatAreMachinesDesc1")}
                </p>
                <p>
                  {t("whatAreMachinesDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("viewingDetails"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("viewingDetailsDesc")}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("viewingDetailsList1")}</li>
                  <li>{t("viewingDetailsList2")}</li>
                  <li>{t("viewingDetailsList3")}</li>
                  <li>{t("viewingDetailsList4")}</li>
                  <li>{t("viewingDetailsList5")}</li>
                  <li>{t("viewingDetailsList6")}</li>
                </ul>
              </div>
            ),
          },
          {
            title: t("managingMachines"),
            content: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">{t("renameMachine")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("renameMachineDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("expireMachine")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("expireMachineDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("deleteMachine")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("deleteMachineDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("moveMachine")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("moveMachineDesc")}
                  </p>
                </div>
              </div>
            ),
          },
          {
            title: t("tagsAndRoutes"),
            content: (
              <div className="space-y-2">
                <p>
                  <strong>{tCommon("tags")}:</strong> {t("tagsDesc")}
                </p>
                <p>
                  <strong>{tCommon("routes")}:</strong> {t("routesDesc")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("tagsRoutesNote")}
                </p>
              </div>
            ),
          },
        ]}
      />

      <MachineList />
    </div>
  );
}

