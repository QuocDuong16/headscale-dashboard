"use client";

import { useTranslations } from "next-intl";
import { SetupGuide } from "@/components/setup/setup-guide";

export default function SetupPage() {
  const t = useTranslations("pages.setup");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <SetupGuide />
    </div>
  );
}

