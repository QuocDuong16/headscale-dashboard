"use client";

import { useTranslations } from "next-intl";
import { UserList } from "@/components/users/user-list";
import { GuideCard } from "@/components/ui/guide-card";
import { Users } from "lucide-react";

export default function UsersPage() {
  const t = useTranslations("pages.users");
  
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
        icon={<Users className="h-5 w-5 text-primary" />}
        sections={[
          {
            title: t("whatAreUsers"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("whatAreUsersDesc1")}
                </p>
                <p>
                  {t("whatAreUsersDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("creatingUsers"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("creatingUsersDesc")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t("creatingUsersStep1")}</li>
                  <li>{t("creatingUsersStep2")}</li>
                  <li>{t("creatingUsersStep3")}</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  {t("creatingUsersNote")}
                </p>
              </div>
            ),
          },
          {
            title: t("managingUsers"),
            content: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">{t("renameUser")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("renameUserDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("deleteUser")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("deleteUserDesc")}
                  </p>
                </div>
              </div>
            ),
          },
          {
            title: t("userMachineRelationships"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("userMachineRelationshipsDesc")}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("userMachineRelationshipsList1")}</li>
                  <li>{t("userMachineRelationshipsList2")}</li>
                  <li>{t("userMachineRelationshipsList3")}</li>
                </ul>
                  <p className="text-xs text-muted-foreground">
                    {t("userMachineRelationshipsNote")}
                  </p>
              </div>
            ),
          },
        ]}
      />

      <UserList />
    </div>
  );
}

