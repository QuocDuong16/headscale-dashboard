import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { Providers } from "../providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Allow on-demand generation in dev mode
export const dynamicParams = true;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering - CRITICAL for Next.js 16
  setRequestLocale(locale);

  // Get messages with error handling
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Failed to load messages:", error);
    // Fallback to empty messages object
    messages = {};
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <div className="flex h-screen flex-col overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background/50 p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </Providers>
    </NextIntlClientProvider>
  );
}

