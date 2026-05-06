import "server-only";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { and, asc, desc, eq, getTableColumns, gte, inArray, lte, max, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  adminUsers,
  dailyPublications,
  imageGenerations,
  verses,
} from "@/db/schema";

import { buildVerseImagePrompt, generateBackground } from "./ai";
import { appConfig } from "./config";
import { uploadAsset } from "./storage";
import { getRecentReuseWindowStart, getTodayDateKey, isPastOrToday } from "./time";

export type PublicPublication = {
  publishDate: string;
  slug: string;
  referenceText: string;
  verseText: string;
  explanationText: string;
  sourceImageUrl: string | null;
  cardImageSimpleUrl: string | null;
  cardImageExtendedUrl: string | null;
  cardImagePortraitUrl: string | null;
};

function deterministicIndex(seed: string, size: number) {
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % size;
}

async function fetchPublicationByDate(publishDate: string) {
  const [row] = await db
    .select({
      publishDate: dailyPublications.publishDate,
      slug: verses.slug,
      referenceText: verses.referenceText,
      verseText: verses.verseText,
      explanationText: verses.explanationText,
      sourceImageUrl: imageGenerations.sourceImageUrl,
      cardImageSimpleUrl: imageGenerations.cardImageSimpleUrl,
      cardImageExtendedUrl: imageGenerations.cardImageExtendedUrl,
      cardImagePortraitUrl: imageGenerations.cardImagePortraitUrl,
    })
    .from(dailyPublications)
    .innerJoin(verses, eq(verses.id, dailyPublications.verseId))
    .innerJoin(
      imageGenerations,
      eq(imageGenerations.id, dailyPublications.generationId),
    )
    .where(
      and(
        eq(dailyPublications.publishDate, publishDate),
        inArray(dailyPublications.status, ["approved", "published"]),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getPublicationForDate(publishDate: string) {
  "use cache";

  cacheLife("hours");
  cacheTag(`publication:${publishDate}`);

  return fetchPublicationByDate(publishDate);
}

export async function getTodayPublication() {
  return getPublicationForDate(getTodayDateKey());
}

export async function getArchivePublications() {
  "use cache";

  cacheLife("hours");
  cacheTag("publications:archive");

  const today = getTodayDateKey();

  return db
    .select({
      publishDate: dailyPublications.publishDate,
      slug: verses.slug,
      referenceText: verses.referenceText,
      verseText: verses.verseText,
      explanationText: verses.explanationText,
      sourceImageUrl: imageGenerations.sourceImageUrl,
      cardImageSimpleUrl: imageGenerations.cardImageSimpleUrl,
      cardImageExtendedUrl: imageGenerations.cardImageExtendedUrl,
      cardImagePortraitUrl: imageGenerations.cardImagePortraitUrl,
    })
    .from(dailyPublications)
    .innerJoin(verses, eq(verses.id, dailyPublications.verseId))
    .innerJoin(
      imageGenerations,
      eq(imageGenerations.id, dailyPublications.generationId),
    )
    .where(
      and(
        lte(dailyPublications.publishDate, today),
        inArray(dailyPublications.status, ["approved", "published"]),
      ),
    )
    .orderBy(desc(dailyPublications.publishDate));
}

export async function getPublicationBySlug(slug: string) {
  "use cache";

  cacheLife("hours");
  cacheTag(`publication:slug:${slug}`);

  const [row] = await db
    .select({
      publishDate: dailyPublications.publishDate,
      slug: verses.slug,
      referenceText: verses.referenceText,
      verseText: verses.verseText,
      explanationText: verses.explanationText,
      sourceImageUrl: imageGenerations.sourceImageUrl,
      cardImageSimpleUrl: imageGenerations.cardImageSimpleUrl,
      cardImageExtendedUrl: imageGenerations.cardImageExtendedUrl,
      cardImagePortraitUrl: imageGenerations.cardImagePortraitUrl,
    })
    .from(dailyPublications)
    .innerJoin(verses, eq(verses.id, dailyPublications.verseId))
    .innerJoin(
      imageGenerations,
      eq(imageGenerations.id, dailyPublications.generationId),
    )
    .where(
      and(
        eq(verses.slug, slug),
        inArray(dailyPublications.status, ["approved", "published"]),
      ),
    )
    .orderBy(desc(dailyPublications.publishDate))
    .limit(1);

  return row ?? null;
}

function revalidatePublicationCaches(publishDate: string, slug: string) {
  for (const tag of [
    `publication:${publishDate}`,
    `publication:slug:${slug}`,
    "publications:archive",
  ]) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Approval can also run from local scripts, outside a Next.js request context.
    }
  }
}

export async function getContentAdminList() {
  const rows = await db
    .select({
      id: verses.id,
      slug: verses.slug,
      referenceText: verses.referenceText,
      translation: verses.translation,
      status: verses.status,
      isActive: verses.isActive,
      createdAt: verses.createdAt,
      lastPublishedDate: max(dailyPublications.publishDate),
    })
    .from(verses)
    .leftJoin(dailyPublications, eq(dailyPublications.verseId, verses.id))
    .groupBy(verses.id)
    .orderBy(asc(verses.referenceText));

  return rows;
}

export async function getAdminOverview() {
  const today = getTodayDateKey();
  const tomorrow = (() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return getTodayDateKey(now);
  })();

  const publications = await db
    .select()
    .from(dailyPublications)
    .where(inArray(dailyPublications.publishDate, [today, tomorrow]))
    .orderBy(asc(dailyPublications.publishDate));

  const generations = await db
    .select({
      targetDate: imageGenerations.targetDate,
      status: imageGenerations.status,
      generationVersion: imageGenerations.generationVersion,
      referenceText: verses.referenceText,
      simpleUrl: imageGenerations.cardImageSimpleUrl,
      portraitUrl: imageGenerations.cardImagePortraitUrl,
    })
    .from(imageGenerations)
    .innerJoin(verses, eq(verses.id, imageGenerations.verseId))
    .where(inArray(imageGenerations.targetDate, [today, tomorrow]))
    .orderBy(desc(imageGenerations.targetDate), desc(imageGenerations.generationVersion));

  return { today, tomorrow, publications, generations };
}

export async function getReviewData(targetDate: string) {
  const generations = await db
    .select({
      id: imageGenerations.id,
      targetDate: imageGenerations.targetDate,
      status: imageGenerations.status,
      generationVersion: imageGenerations.generationVersion,
      triggerType: imageGenerations.triggerType,
      provider: imageGenerations.provider,
      providerModel: imageGenerations.providerModel,
      promptSnapshot: imageGenerations.promptSnapshot,
      errorMessage: imageGenerations.errorMessage,
      sourceImageUrl: imageGenerations.sourceImageUrl,
      cardImageSimpleUrl: imageGenerations.cardImageSimpleUrl,
      cardImageExtendedUrl: imageGenerations.cardImageExtendedUrl,
      cardImagePortraitUrl: imageGenerations.cardImagePortraitUrl,
      createdAt: imageGenerations.createdAt,
      referenceText: verses.referenceText,
      verseText: verses.verseText,
      explanationText: verses.explanationText,
      slug: verses.slug,
    })
    .from(imageGenerations)
    .innerJoin(verses, eq(verses.id, imageGenerations.verseId))
    .where(eq(imageGenerations.targetDate, targetDate))
    .orderBy(desc(imageGenerations.generationVersion));

  const [publication] = await db
    .select()
    .from(dailyPublications)
    .where(eq(dailyPublications.publishDate, targetDate))
    .limit(1);

  return { generations, publication: publication ?? null };
}

async function selectCandidateVerse(targetDate: string) {
  const recentWindowStart = getRecentReuseWindowStart();

  const usedRows = await db
    .select({ verseId: dailyPublications.verseId })
    .from(dailyPublications)
    .where(
      and(
        gte(dailyPublications.publishDate, recentWindowStart),
        lte(dailyPublications.publishDate, targetDate),
        inArray(dailyPublications.status, ["approved", "published"]),
      ),
    );

  const usedVerseIds = new Set(usedRows.map((row) => row.verseId));
  const candidates = await db
    .select()
    .from(verses)
    .where(and(eq(verses.status, "ready"), eq(verses.isActive, true)))
    .orderBy(asc(verses.referenceText));

  const eligible = candidates.filter((candidate) => !usedVerseIds.has(candidate.id));

  if (!eligible.length) {
    throw new Error("No eligible verses available for generation.");
  }

  return eligible[deterministicIndex(targetDate, eligible.length)];
}

async function selectPublishedVerseForDate(targetDate: string) {
  const [row] = await db
    .select(getTableColumns(verses))
    .from(dailyPublications)
    .innerJoin(verses, eq(verses.id, dailyPublications.verseId))
    .where(
      and(
        eq(dailyPublications.publishDate, targetDate),
        inArray(dailyPublications.status, ["approved", "published"]),
      ),
    )
    .limit(1);

  return row ?? null;
}

async function selectVerseForGeneration(
  targetDate: string,
  triggerType: "cron" | "manual_regenerate",
) {
  if (triggerType === "manual_regenerate") {
    const publishedVerse = await selectPublishedVerseForDate(targetDate);

    if (publishedVerse) {
      return publishedVerse;
    }
  }

  return selectCandidateVerse(targetDate);
}

async function getNextGenerationVersion(targetDate: string) {
  const [row] = await db
    .select({ maxVersion: max(imageGenerations.generationVersion) })
    .from(imageGenerations)
    .where(eq(imageGenerations.targetDate, targetDate));

  return (row?.maxVersion ?? 0) + 1;
}

export async function generateCandidateForDate(
  targetDate: string,
  triggerType: "cron" | "manual_regenerate" = "cron",
) {
  if (triggerType === "cron") {
    const existing = await db
      .select({
        id: imageGenerations.id,
        status: imageGenerations.status,
      })
      .from(imageGenerations)
      .where(
        and(
          eq(imageGenerations.targetDate, targetDate),
          inArray(imageGenerations.status, [
            "pending",
            "processing",
            "review_required",
            "approved",
          ]),
        ),
      )
      .limit(1);

    if (existing.length) {
      return { skipped: true as const, generationId: existing[0].id };
    }
  }

  const verse = await selectVerseForGeneration(targetDate, triggerType);
  const generationVersion = await getNextGenerationVersion(targetDate);
  const imagePrompt = buildVerseImagePrompt({
    siteName: appConfig.siteName,
    referenceText: verse.referenceText,
    verseText: verse.verseText,
    explanationText: verse.explanationText,
    promptText: verse.promptText,
  });

  const [generation] = await db
    .insert(imageGenerations)
    .values({
      verseId: verse.id,
      targetDate,
      provider: appConfig.aiProvider,
      providerModel: appConfig.aiProviderModel,
      promptSnapshot: imagePrompt,
      triggerType,
      generationVersion,
      status: "pending",
    })
    .returning();

  try {
    await db
      .update(imageGenerations)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(imageGenerations.id, generation.id));

    const image = await generateBackground(imagePrompt);
    const imageKey = `cards/${targetDate}/generation-${generationVersion}-ai.${image.extension}`;
    const imageUpload = await uploadAsset({
      key: imageKey,
      body: image.buffer,
      contentType: image.mediaType,
    });

    const [updated] = await db
      .update(imageGenerations)
      .set({
        sourceImageUrl: imageUpload.url,
        cardImageSimpleUrl: imageUpload.url,
        cardImageExtendedUrl: imageUpload.url,
        cardImagePortraitUrl: imageUpload.url,
        storageProvider: imageUpload.provider,
        status: "review_required",
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(imageGenerations.id, generation.id))
      .returning();

    return { skipped: false as const, generation: updated, verse };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown generation error.";

    await db
      .update(imageGenerations)
      .set({
        status: "failed",
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(imageGenerations.id, generation.id));

    throw error;
  }
}

export async function approveGeneration(targetDate: string, generationId: string, adminId: string) {
  const [generation] = await db
    .select({
      id: imageGenerations.id,
      verseId: imageGenerations.verseId,
      slug: verses.slug,
    })
    .from(imageGenerations)
    .innerJoin(verses, eq(verses.id, imageGenerations.verseId))
    .where(eq(imageGenerations.id, generationId))
    .limit(1);

  if (!generation) {
    throw new Error("Generation not found.");
  }

  const publicationStatus = isPastOrToday(targetDate) ? "published" : "approved";

  await db
    .update(imageGenerations)
    .set({ status: "superseded", updatedAt: new Date() })
    .where(
      and(
        eq(imageGenerations.targetDate, targetDate),
        eq(imageGenerations.status, "approved"),
        sql`${imageGenerations.id} <> ${generationId}`,
      ),
    );

  await db
    .update(imageGenerations)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(imageGenerations.id, generationId));

  const existingPublication = await db
    .select({ id: dailyPublications.id })
    .from(dailyPublications)
    .where(eq(dailyPublications.publishDate, targetDate))
    .limit(1);

  if (existingPublication.length) {
    const [updated] = await db
      .update(dailyPublications)
      .set({
        verseId: generation.verseId,
        generationId,
        status: publicationStatus,
        approvedBy: adminId,
        approvedAt: new Date(),
        publishedAt: publicationStatus === "published" ? new Date() : null,
        skipReason: null,
        updatedAt: new Date(),
      })
      .where(eq(dailyPublications.id, existingPublication[0].id))
      .returning();

    revalidatePublicationCaches(targetDate, generation.slug);

    return updated;
  }

  const [created] = await db
    .insert(dailyPublications)
    .values({
      publishDate: targetDate,
      verseId: generation.verseId,
      generationId,
      status: publicationStatus,
      approvedBy: adminId,
      approvedAt: new Date(),
      publishedAt: publicationStatus === "published" ? new Date() : null,
    })
    .returning();

  revalidatePublicationCaches(targetDate, generation.slug);

  return created;
}

export async function rejectGeneration(generationId: string, reason?: string) {
  const [updated] = await db
    .update(imageGenerations)
    .set({
      status: "rejected",
      errorMessage: reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(imageGenerations.id, generationId))
    .returning();

  return updated;
}

export async function ensureTodayPublicationStatus() {
  const today = getTodayDateKey();

  await db
    .update(dailyPublications)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dailyPublications.publishDate, today),
        eq(dailyPublications.status, "approved"),
      ),
    );
}

export async function getAdminUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  return user ?? null;
}
