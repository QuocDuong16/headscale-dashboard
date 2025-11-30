"use client";

import { useTranslations } from "next-intl";
import { RouteList } from "@/components/routes/route-list";
import { GuideCard } from "@/components/ui/guide-card";
import { Route } from "lucide-react";

export default function RoutesPage() {
  const t = useTranslations("pages.routes");
  
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
        icon={<Route className="h-5 w-5 text-primary" />}
        sections={[
          {
            title: t("whatAreRoutes"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("whatAreRoutesDesc1")}
                </p>
                <p>
                  {t("whatAreRoutesDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("howRoutesWork"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("howRoutesWorkDesc1")}
                </p>
                <p>
                  {t("howRoutesWorkDesc2")}
                </p>
              </div>
            ),
          },
          {
            title: t("enablingDisabling"),
            content: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">{t("enableRoute")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("enableRouteDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("disableRoute")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("disableRouteDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("deleteRoute")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("deleteRouteDesc")}
                  </p>
                </div>
              </div>
            ),
          },
          {
            title: t("bestPractices"),
            content: (
              <div className="space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("bestPracticesList1")}</li>
                  <li>{t("bestPracticesList2")}</li>
                  <li>{t("bestPracticesList3")}</li>
                  <li>{t("bestPracticesList4")}</li>
                  <li>{t("bestPracticesList5")}</li>
                </ul>
              </div>
            ),
          },
        ]}
      />

      <RouteList />
    </div>
  );
}

