import dotenv from "dotenv";
import { desc, eq } from "drizzle-orm";
import { spawnSync } from "node:child_process";

process.env.DOTENV_CONFIG_QUIET ??= "true";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

function parseTargetDate(rawValue: string | undefined) {
  if (!rawValue || !/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    throw new Error("Expected a target date argument in YYYY-MM-DD format.");
  }

  const parsed = new Date(`${rawValue}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== rawValue) {
    throw new Error("Target date must be a valid calendar date in YYYY-MM-DD format.");
  }

  return rawValue;
}

function unwrapModule<T>(module: T): T extends { default: infer U } ? U : T {
  return ((module as { default?: unknown }).default ?? module) as T extends {
    default: infer U;
  }
    ? U
    : T;
}

async function main() {
  if (process.argv[2] === "--internal-generate") {
    const internalTargetDate = parseTargetDate(process.argv[3]);
    const { generateCandidateForDate } = unwrapModule(await import("@/lib/publication"));
    await generateCandidateForDate(internalTargetDate, "manual_regenerate");
    return;
  }

  const targetDate = parseTargetDate(process.argv[2]);

  const child = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      process.argv[1],
      "--internal-generate",
      targetDate,
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DOTENV_CONFIG_QUIET: "true",
      },
      encoding: "utf8",
      stdio: "pipe",
    },
  );

  if (child.status !== 0) {
    throw new Error(
      child.stderr.trim() || child.stdout.trim() || "Generation subprocess failed.",
    );
  }

  const [{ db }, { imageGenerations }] = (
    await Promise.all([import("@/db"), import("@/db/schema")])
  ).map(unwrapModule);

  const [stored] = await db
    .select({
      generationId: imageGenerations.id,
      generationVersion: imageGenerations.generationVersion,
      status: imageGenerations.status,
      storageProvider: imageGenerations.storageProvider,
      sourceImageUrl: imageGenerations.sourceImageUrl,
      cardImageSimpleUrl: imageGenerations.cardImageSimpleUrl,
      cardImageExtendedUrl: imageGenerations.cardImageExtendedUrl,
    })
    .from(imageGenerations)
    .where(eq(imageGenerations.targetDate, targetDate))
    .orderBy(desc(imageGenerations.generationVersion))
    .limit(1);

  if (!stored) {
    throw new Error(`No image generation record found for ${targetDate}.`);
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        targetDate,
        generationId: stored.generationId,
        generationVersion: stored.generationVersion,
        status: stored.status,
        storageProvider: stored.storageProvider,
        sourceImageUrl: stored.sourceImageUrl,
        cardImageSimpleUrl: stored.cardImageSimpleUrl,
        cardImageExtendedUrl: stored.cardImageExtendedUrl,
        publicUrls: [
          stored.sourceImageUrl,
          stored.cardImageSimpleUrl,
          stored.cardImageExtendedUrl,
        ].filter((url): url is string => Boolean(url)),
      },
      null,
      2,
    )}\n`,
  );
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown verification error.";
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
