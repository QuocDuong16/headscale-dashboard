"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

interface GuideSection {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface GuideCardProps {
  title: string;
  description?: string;
  sections: GuideSection[];
  icon?: React.ReactNode;
}

export function GuideCard({ title, description, sections, icon }: GuideCardProps) {
  // Calculate defaultValue - use empty array to ensure server and client render the same
  // This prevents hydration mismatch. The accordion will start closed on both server and client.
  // Users can still open sections manually after hydration.
  const defaultValue: string[] = [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon || <HelpCircle className="h-5 w-5 text-primary" />}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={defaultValue}>
          {sections.map((section, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

