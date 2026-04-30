import dotenv from "dotenv";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  adminUsers,
  dailyPublications,
  imageGenerations,
  verses,
} from "@/db/schema";
import { slugify } from "@/lib/text";
import { getTodayDateKey } from "@/lib/time";

dotenv.config({ path: ".env.local" });
dotenv.config();

const seedVerses = [
  {
    bookName: "Psalms",
    chapter: 23,
    verseRange: "1",
    referenceText: "Psalm 23:1",
    verseText: "The Lord is my shepherd; I shall not want.",
    explanationText:
      "God is not distant from your daily needs. His care is steady, personal, and enough for today.",
    themeTags: ["Provision", "Peace"],
    promptText:
      "A peaceful shepherding landscape at sunrise, green hills, still waters, gentle light, hopeful and reverent mood.",
  },
  {
    bookName: "Isaiah",
    chapter: 41,
    verseRange: "10",
    referenceText: "Isaiah 41:10",
    verseText:
      "Fear thou not; for I am with thee: be not dismayed; for I am thy God.",
    explanationText:
      "You do not face uncertainty alone. God's presence gives courage when your heart feels unsteady.",
    themeTags: ["Courage", "Presence"],
    promptText:
      "A hopeful mountain path with dawn light breaking through clouds, symbolic of courage, strength, and divine presence.",
  },
  {
    bookName: "Matthew",
    chapter: 11,
    verseRange: "28",
    referenceText: "Matthew 11:28",
    verseText:
      "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    explanationText:
      "Jesus invites the weary to bring their burdens honestly. Rest begins when you stop pretending to carry everything alone.",
    themeTags: ["Rest", "Comfort"],
    promptText:
      "A calm lakeside at sunset with warm golden tones, quiet stillness, invitation to rest, spiritually comforting atmosphere.",
  },
  {
    bookName: "Romans",
    chapter: 8,
    verseRange: "28",
    referenceText: "Romans 8:28",
    verseText:
      "And we know that all things work together for good to them that love God.",
    explanationText:
      "Even when the full picture is unclear, God is still at work. His goodness can reach into places that feel unfinished.",
    themeTags: ["Hope", "Trust"],
    promptText:
      "A dramatic sky turning into clear morning light over rolling fields, visualizing hope, redemption, and trust in God's plan.",
  },
  {
    bookName: "Philippians",
    chapter: 4,
    verseRange: "6-7",
    referenceText: "Philippians 4:6-7",
    verseText:
      "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
    explanationText:
      "Prayer does not deny your anxiety; it reorients it. As you bring your concerns to God, His peace begins to guard your inner life.",
    themeTags: ["Prayer", "Peace"],
    promptText:
      "A serene evening sky with soft stars above a quiet village, peaceful prayerful mood, comforting and hopeful lighting.",
  },
];

async function seedAdminUser() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-in-production";

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  if (existing.length) {
    return;
  }

  await db.insert(adminUsers).values({
    username,
    passwordHash: await bcrypt.hash(password, 10),
  });
}

async function seedVerseData() {
  for (const verse of seedVerses) {
    const slug = slugify(`${verse.referenceText}-${verse.bookName}`);

    const existing = await db
      .select({ id: verses.id })
      .from(verses)
      .where(eq(verses.slug, slug))
      .limit(1);

    if (existing.length) {
      continue;
    }

    await db.insert(verses).values({
      ...verse,
      slug,
      translation: "WEB",
      status: "ready",
      isActive: true,
    });
  }
}

function createSeedCardSvg(referenceText: string, verseText: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2c5364" />
      <stop offset="50%" stop-color="#203a43" />
      <stop offset="100%" stop-color="#0f2027" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="64" y="64" width="1072" height="502" rx="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" />
  <text x="96" y="124" fill="rgba(255,255,255,0.82)" font-size="24" font-family="Arial, sans-serif">SEEDED DEMO CARD</text>
  <text x="96" y="208" fill="#ffffff" font-size="50" font-family="Georgia, serif">${referenceText}</text>
  <text x="96" y="294" fill="rgba(255,255,255,0.92)" font-size="34" font-family="Georgia, serif">${verseText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</text>
</svg>`;
}

async function seedPublishedToday() {
  const today = getTodayDateKey();
  const existingPublication = await db
    .select({ id: dailyPublications.id })
    .from(dailyPublications)
    .where(eq(dailyPublications.publishDate, today))
    .limit(1);

  if (existingPublication.length) {
    return;
  }

  const [firstVerse] = await db
    .select()
    .from(verses)
    .where(and(eq(verses.status, "ready"), eq(verses.isActive, true)))
    .limit(1);

  if (!firstVerse) {
    return;
  }

  const outputDir = path.join(process.cwd(), "public", "generated", "seed", today);
  await mkdir(outputDir, { recursive: true });

  const simpleFileName = "simple.svg";
  const extendedFileName = "extended.svg";
  await writeFile(
    path.join(outputDir, simpleFileName),
    createSeedCardSvg(firstVerse.referenceText, firstVerse.verseText),
  );
  await writeFile(
    path.join(outputDir, extendedFileName),
    createSeedCardSvg(firstVerse.referenceText, firstVerse.explanationText),
  );

  const baseUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";
  const simpleUrl = `${baseUrl}/generated/seed/${today}/${simpleFileName}`;
  const extendedUrl = `${baseUrl}/generated/seed/${today}/${extendedFileName}`;

  const [generation] = await db
    .insert(imageGenerations)
    .values({
      verseId: firstVerse.id,
      targetDate: today,
      provider: "seed",
      providerModel: "seed-static-card",
      promptSnapshot: firstVerse.promptText,
      sourceImageUrl: simpleUrl,
      cardImageSimpleUrl: simpleUrl,
      cardImageExtendedUrl: extendedUrl,
      storageProvider: "local",
      status: "approved",
      triggerType: "cron",
      generationVersion: 1,
    })
    .returning();

  const [admin] = await db.select().from(adminUsers).limit(1);

  await db.insert(dailyPublications).values({
    publishDate: today,
    verseId: firstVerse.id,
    generationId: generation.id,
    status: "published",
    approvedBy: admin?.id,
    approvedAt: new Date(),
    publishedAt: new Date(),
  });
}

async function main() {
  await seedAdminUser();
  await seedVerseData();
  await seedPublishedToday();
  console.log("Seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
