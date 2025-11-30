"use client";

import { useTranslations } from "next-intl";
import { ApiKeyList } from "@/components/api-keys/api-key-list";
import { GuideCard } from "@/components/ui/guide-card";
import { Key } from "lucide-react";

export default function ApiKeysPage() {
  const t = useTranslations("pages.apiKeys");
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
        icon={<Key className="h-5 w-5 text-primary" />}
        sections={[
          {
            title: t("whatAreApiKeys"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("whatAreApiKeysDesc1")}
                </p>
                <p>
                  {t("whatAreApiKeysDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("generatingApiKeys"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("generatingApiKeysDesc")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t("generatingApiKeysStep1")}</li>
                  <li>{t("generatingApiKeysStep2")}</li>
                  <li>{t("generatingApiKeysStep3")}</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  <strong>{tCommon("error")}:</strong> {t("generatingApiKeysNote")}
                </p>
              </div>
            ),
          },
          {
            title: t("usingApiKeys"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("usingApiKeysDesc")}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("usingApiKeysList1")}</li>
                  <li>{t("usingApiKeysList2")}</li>
                  <li>{t("usingApiKeysList3")}</li>
                </ul>
              </div>
            ),
          },
          {
            title: t("securityBestPractices"),
            content: (
              <div className="space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("securityBestPracticesList1")}</li>
                  <li>{t("securityBestPracticesList2")}</li>
                  <li>{t("securityBestPracticesList3")}</li>
                  <li>{t("securityBestPracticesList4")}</li>
                  <li>{t("securityBestPracticesList5")}</li>
                  <li>{t("securityBestPracticesList6")}</li>
                </ul>
              </div>
            ),
          },
        ]}
      />

      <ApiKeyList />
    </div>
  );
}

