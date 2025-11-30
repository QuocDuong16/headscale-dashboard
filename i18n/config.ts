import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

export type Locale = (typeof routing.locales)[number];

export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  // Load messages with error handling
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}":`, error);
    // Fallback to English messages if locale messages fail to load
    try {
      messages = (await import(`../messages/${routing.defaultLocale}.json`)).default;
    } catch (fallbackError) {
      console.error("Failed to load fallback messages:", fallbackError);
      messages = {};
    }
  }
  
  return {
    messages,
    locale: locale as string,
  };
});

