"use client";

import { useTranslations, useLocale } from "next-intl";
import { PreAuthKeyList } from "@/components/preauth-keys/preauth-key-list";
import { PendingRegistrations } from "@/components/preauth-keys/pending-registrations";
import { GuideCard } from "@/components/ui/guide-card";
import { Key } from "lucide-react";
import Link from "next/link";

export default function PreAuthKeysPage() {
  const t = useTranslations("pages.preauthKeys");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <PendingRegistrations />

      <GuideCard
        title={t("guideTitle")}
        description={t("guideDesc")}
        icon={<Key className="h-5 w-5 text-primary" />}
        sections={[
          {
            title: t("whatArePreAuthKeys"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("whatArePreAuthKeysDesc1")}
                </p>
                <p>
                  {t("whatArePreAuthKeysDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("generatingKeys"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("generatingKeysDesc")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t("generatingKeysStep1")}</li>
                  <li>{t("generatingKeysStep2")}</li>
                  <li>{t("generatingKeysStep3")}</li>
                  <li>{t("generatingKeysStep4")}</li>
                  <li>{t("generatingKeysStep5")}</li>
                  <li>{t("generatingKeysStep6")}</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  <strong>{tCommon("error")}:</strong> {t("generatingKeysNote")}
                </p>
              </div>
            ),
          },
          {
            title: t("usingKeys"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("usingKeysDesc")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t("usingKeysStep1")}</li>
                  <li>{t("usingKeysStep2")}</li>
                  <li>{t.rich("usingKeysStep3", {
                    setup: (chunks) => <Link key="setup" href={`/${locale}/setup`} className="text-primary hover:underline">{chunks}</Link>
                  })}</li>
                  <li>{t("usingKeysStep4")}</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  {t("usingKeysExample")}
                </p>
              </div>
            ),
          },
          {
            title: t("keyExpiration"),
            content: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">{t("expiration")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("expirationDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("ephemeralKeys")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("ephemeralKeysDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("expiringKeys")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("expiringKeysDesc")}
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />

      <PreAuthKeyList />
    </div>
  );
}

