export const appConfig = {
  siteName: "Bible Daily Verse",
  siteDescription:
    "Daily Bible verses with gentle encouragement, shareable cards, and an archive of past scripture reflections.",
  siteUrl: process.env.PUBLIC_SITE_URL ?? "http://localhost:3000",
  timezone: process.env.DEFAULT_TIMEZONE ?? "America/New_York",
  adminCookieName: "bible-verse-admin-session",
  cronSecret: process.env.CRON_SECRET ?? "dev-cron-secret",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-session-secret",
  aiProvider: process.env.AI_PROVIDER ?? "mock",
  aiProviderModel: process.env.AI_PROVIDER_MODEL ?? "mock-gradient-v1",
} as const;
