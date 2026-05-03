export function getDefaultAiProviderModel(provider: string) {
  if (provider === "openai") {
    return "gpt-image-2";
  }

  if (provider === "openrouter") {
    return "google/gemini-3.1-flash-image-preview";
  }

  return "mock-gradient-v1";
}

const aiProvider = process.env.AI_PROVIDER ?? "mock";
const aiProviderModel = process.env.AI_PROVIDER_MODEL ?? getDefaultAiProviderModel(aiProvider);

export const appConfig = {
  siteName: "Bible Daily Verse",
  siteDescription:
    "Daily Bible verses with gentle encouragement, shareable cards, and an archive of past scripture reflections.",
  siteUrl: process.env.PUBLIC_SITE_URL ?? "http://localhost:3000",
  timezone: process.env.DEFAULT_TIMEZONE ?? "America/New_York",
  adminCookieName: "bible-verse-admin-session",
  cronSecret: process.env.CRON_SECRET ?? "dev-cron-secret",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-session-secret",
  aiProvider,
  aiProviderModel,
} as const;
