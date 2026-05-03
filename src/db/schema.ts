import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const verseStatusEnum = pgEnum("verse_status", [
  "draft",
  "ready",
  "disabled",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "processing",
  "review_required",
  "approved",
  "rejected",
  "failed",
  "superseded",
]);

export const generationTriggerEnum = pgEnum("generation_trigger", [
  "cron",
  "manual_regenerate",
]);

export const publicationStatusEnum = pgEnum("publication_status", [
  "scheduled",
  "approved",
  "published",
  "skipped",
  "cancelled",
]);

export const storageProviderEnum = pgEnum("storage_provider", ["local", "r2"]);

export const adminRoleEnum = pgEnum("admin_role", ["owner"]);

export const verses = pgTable(
  "verses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    bookName: text("book_name").notNull(),
    chapter: integer("chapter").notNull(),
    verseRange: text("verse_range").notNull(),
    referenceText: text("reference_text").notNull(),
    translation: text("translation").notNull().default("WEB"),
    verseText: text("verse_text").notNull(),
    explanationText: text("explanation_text").notNull(),
    themeTags: jsonb("theme_tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    promptText: text("prompt_text").notNull(),
    status: verseStatusEnum("status").notNull().default("draft"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    referenceIdx: index("verses_reference_idx").on(
      table.bookName,
      table.chapter,
      table.verseRange,
    ),
    statusIdx: index("verses_status_idx").on(table.status, table.isActive),
  }),
);

export const imageGenerations = pgTable(
  "image_generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => verses.id, { onDelete: "cascade" }),
    targetDate: text("target_date").notNull(),
    provider: text("provider").notNull(),
    providerModel: text("provider_model").notNull(),
    promptSnapshot: text("prompt_snapshot").notNull(),
    sourceImageUrl: text("source_image_url"),
    cardImageSimpleUrl: text("card_image_simple_url"),
    cardImageExtendedUrl: text("card_image_extended_url"),
    cardImagePortraitUrl: text("card_image_portrait_url"),
    storageProvider: storageProviderEnum("storage_provider")
      .notNull()
      .default("local"),
    status: generationStatusEnum("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    triggerType: generationTriggerEnum("trigger_type").notNull(),
    generationVersion: integer("generation_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    targetDateIdx: index("image_generations_target_date_idx").on(table.targetDate),
    verseDateIdx: index("image_generations_verse_date_idx").on(
      table.verseId,
      table.targetDate,
    ),
    versionUniqueIdx: uniqueIndex("image_generations_target_date_version_idx").on(
      table.targetDate,
      table.generationVersion,
    ),
  }),
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("owner"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("admin_sessions_user_idx").on(table.userId),
  }),
);

export const dailyPublications = pgTable(
  "daily_publications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publishDate: text("publish_date").notNull(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => verses.id, { onDelete: "cascade" }),
    generationId: uuid("generation_id")
      .notNull()
      .references(() => imageGenerations.id, { onDelete: "cascade" }),
    status: publicationStatusEnum("status").notNull().default("scheduled"),
    approvedBy: uuid("approved_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    skipReason: text("skip_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    publishDateIdx: index("daily_publications_publish_date_idx").on(table.publishDate),
    publishDateStatusUniqueIdx: uniqueIndex(
      "daily_publications_publish_date_status_unique_idx",
    )
      .on(table.publishDate)
      .where(sql`${table.status} in ('approved', 'published')`),
    dateGenerationUniqueIdx: uniqueIndex(
      "daily_publications_date_generation_unique_idx",
    ).on(table.publishDate, table.generationId),
  }),
);

export type Verse = typeof verses.$inferSelect;
export type ImageGeneration = typeof imageGenerations.$inferSelect;
export type DailyPublication = typeof dailyPublications.$inferSelect;
