"use client";

import { useTranslations } from "next-intl";
import { ACLEditor } from "@/components/acls/acl-editor";
import { GuideCard } from "@/components/ui/guide-card";
import { Shield } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";

export default function ACLsPage() {
  const t = useTranslations("pages.acls");
  
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
        icon={<Shield className="h-5 w-5 text-primary" />}
        sections={[
          {
            title: t("whatAreAcls"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("whatAreAclsDesc1")}
                </p>
                <p>
                  {t("whatAreAclsDesc2")}
                </p>
              </div>
            ),
            defaultOpen: true,
          },
          {
            title: t("aclPolicyStructure"),
            content: (
              <div className="space-y-3">
                <p>
                  {t("aclPolicyStructureDesc")}
                </p>
                <div>
                  <p className="font-medium mb-1">{t("groups")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("groupsDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("hosts")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("hostsDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("aclsSection")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("aclsSectionDesc")}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">{t("tests")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("testsDesc")}
                  </p>
                </div>
              </div>
            ),
          },
          {
            title: t("configuringAcls"),
            content: (
              <div className="space-y-2">
                <p>
                  {t("configuringAclsDesc")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t("configuringAclsStep1")}</li>
                  <li>{t("configuringAclsStep2")}</li>
                  <li>{t("configuringAclsStep3")}</li>
                  <li>{t("configuringAclsStep4")}</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  {t("configuringAclsNote")}
                </p>
              </div>
            ),
          },
          {
            title: t("commonPatterns"),
            content: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">{t("allowAllTraffic")}</p>
                  <CodeBlock 
                    code={`{
  "acls": [
    { "action": "accept", "src": ["*"], "dst": ["*:*"] }
  ]
}`}
                  />
                </div>
                <div>
                  <p className="font-medium mb-1">{t("allowSpecificGroup")}</p>
                  <CodeBlock 
                    code={`{
  "groups": {
    "group:admins": ["user1", "user2"]
  },
  "acls": [
    { "action": "accept", "src": ["group:admins"], "dst": ["*:*"] }
  ]
}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("moreExamples")}
                </p>
              </div>
            ),
          },
        ]}
      />

      <ACLEditor />
    </div>
  );
}

