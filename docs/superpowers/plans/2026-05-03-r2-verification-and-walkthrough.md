# R2 Verification And Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify one real test-date generation through the existing app pipeline with Cloudflare R2, then deliver a browser-first teaching walkthrough plus concise repo docs that explain the full storage and authentication flow.

**Architecture:** Reuse the existing `generateCandidateForDate()` server-side path so verification follows the same logic as the app. Add a small server-safe verification script, a browser explainer page set under the active visual companion session, and project-specific documentation that maps environment variables and request flow back to concrete files.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, PostgreSQL, AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`), Cloudflare R2, HTML explainer screens, shell verification commands.

---

### Task 1: Add a reusable verification script for a test-date generation

**Files:**
- Create: `scripts/verify-r2-generation.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing execution path in the new script**

```ts
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const targetDate = process.argv[2];

if (!targetDate) {
  throw new Error("Usage: tsx scripts/verify-r2-generation.ts YYYY-MM-DD");
}

throw new Error("Not implemented yet.");
```

- [ ] **Step 2: Run it to verify it fails for the expected reason**

Run: `node --import tsx scripts/verify-r2-generation.ts 2099-12-31`

Expected: FAIL with `Not implemented yet.`

- [ ] **Step 3: Replace the stub with the real verification flow**

```ts
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { imageGenerations } from "@/db/schema";
import { generateCandidateForDate } from "@/lib/publication";

const targetDate = process.argv[2];

if (!targetDate) {
  throw new Error("Usage: tsx scripts/verify-r2-generation.ts YYYY-MM-DD");
}

const result = await generateCandidateForDate(targetDate, "manual_regenerate");

const [stored] = await db
  .select()
  .from(imageGenerations)
  .where(
    and(
      eq(imageGenerations.targetDate, targetDate),
      eq(
        imageGenerations.generationVersion,
        result.skipped ? 0 : result.generation.generationVersion,
      ),
    ),
  )
  .limit(1);

console.log(
  JSON.stringify(
    {
      targetDate,
      skipped: result.skipped,
      generationId: result.skipped
        ? result.generationId
        : result.generation.id,
      storageProvider: stored?.storageProvider ?? null,
      sourceImageUrl: stored?.sourceImageUrl ?? null,
      cardImageSimpleUrl: stored?.cardImageSimpleUrl ?? null,
      cardImageExtendedUrl: stored?.cardImageExtendedUrl ?? null,
      status: stored?.status ?? null,
    },
    null,
    2,
  ),
);
```

- [ ] **Step 4: Make the script robust for skipped/manual behavior and print stable output**

```ts
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { imageGenerations } from "@/db/schema";
import { generateCandidateForDate } from "@/lib/publication";

const targetDate = process.argv[2];

if (!targetDate) {
  throw new Error("Usage: tsx scripts/verify-r2-generation.ts YYYY-MM-DD");
}

await generateCandidateForDate(targetDate, "manual_regenerate");

const [stored] = await db
  .select()
  .from(imageGenerations)
  .where(eq(imageGenerations.targetDate, targetDate))
  .orderBy(desc(imageGenerations.generationVersion))
  .limit(1);

if (!stored) {
  throw new Error(`No generation stored for ${targetDate}.`);
}

console.log(
  JSON.stringify(
    {
      targetDate,
      generationId: stored.id,
      generationVersion: stored.generationVersion,
      status: stored.status,
      storageProvider: stored.storageProvider,
      sourceImageUrl: stored.sourceImageUrl,
      cardImageSimpleUrl: stored.cardImageSimpleUrl,
      cardImageExtendedUrl: stored.cardImageExtendedUrl,
    },
    null,
    2,
  ),
);
```

- [ ] **Step 5: Add a package script for repeatable use**

```json
{
  "scripts": {
    "verify:r2-generation": "node --import tsx scripts/verify-r2-generation.ts"
  }
}
```

- [ ] **Step 6: Run the script to verify it produces JSON output**

Run: `npm run verify:r2-generation -- 2099-12-31`

Expected: PASS with JSON that includes `storageProvider`, `sourceImageUrl`, `cardImageSimpleUrl`, and `cardImageExtendedUrl`

- [ ] **Step 7: Commit the script changes**

```bash
git add package.json scripts/verify-r2-generation.ts
git commit -m "feat: add r2 generation verification script"
```

### Task 2: Verify public asset access and surface the evidence cleanly

**Files:**
- Modify: `scripts/verify-r2-generation.ts`

- [ ] **Step 1: Extend the script output to make public URL verification easy**

```ts
console.log(
  JSON.stringify(
    {
      targetDate,
      generationId: stored.id,
      generationVersion: stored.generationVersion,
      status: stored.status,
      storageProvider: stored.storageProvider,
      publicUrls: [
        stored.sourceImageUrl,
        stored.cardImageSimpleUrl,
        stored.cardImageExtendedUrl,
      ].filter(Boolean),
    },
    null,
    2,
  ),
);
```

- [ ] **Step 2: Run the generation script again and capture one public URL**

Run: `npm run verify:r2-generation -- 2099-12-31`

Expected: PASS with a `publicUrls` array using the configured `R2_PUBLIC_BASE_URL`

- [ ] **Step 3: Verify one uploaded asset is anonymously reachable**

Run: `curl -I -sS "<one public URL from the script output>"`

Expected: PASS with `HTTP/1.1 200 OK`

- [ ] **Step 4: Commit if the script output shape changed**

```bash
git add scripts/verify-r2-generation.ts
git commit -m "chore: improve r2 verification output"
```

### Task 3: Replace the template README with project-specific setup and R2 guidance

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the template opening with project-specific overview text**

```md
# Bible Daily Verse

Bible Daily Verse is a Next.js devotional publishing app that selects a verse, renders shareable SVG cards, stores assets locally or in Cloudflare R2, and serves a public daily reading experience with an admin review flow.
```

- [ ] **Step 2: Add local setup and environment variable guidance**

```md
## Environment

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL`: PostgreSQL connection string used by Drizzle and server scripts
- `PUBLIC_SITE_URL`: base URL used when storing public asset links
- `AI_PROVIDER` / `AI_PROVIDER_MODEL`: provider labels stored with generated assets
- `R2_ACCOUNT_ID`: Cloudflare account identifier used to build the S3 API endpoint
- `R2_ACCESS_KEY_ID`: S3-compatible access key for authenticated uploads
- `R2_SECRET_ACCESS_KEY`: S3-compatible secret used by the AWS SDK to sign requests
- `R2_BUCKET`: destination bucket name
- `R2_PUBLIC_BASE_URL`: browser-facing public delivery base URL, such as an `r2.dev` or custom domain
```

- [ ] **Step 3: Add a short architecture section tied to concrete files**

```md
## How generation works

1. `src/lib/publication.ts` selects an eligible verse and creates an `image_generations` row.
2. `src/lib/ai.ts` produces the current mock SVG background.
3. `src/lib/cards.ts` renders the simple and extended SVG cards.
4. `src/lib/storage.ts` uploads each asset either to `public/generated/...` or to Cloudflare R2.
5. The resulting URLs are stored in Postgres and later rendered by the public pages under `src/app/`.
```

- [ ] **Step 4: Add the new verification command**

```md
## Verification

Run a test-date R2 verification without affecting the live schedule:

```bash
npm run verify:r2-generation -- 2099-12-31
```
```

- [ ] **Step 5: Run a quick README sanity check**

Run: `sed -n '1,260p' README.md`

Expected: project-specific setup and R2 guidance with no leftover create-next-app template sections

- [ ] **Step 6: Commit the README update**

```bash
git add README.md
git commit -m "docs: replace template readme with project docs"
```

### Task 4: Add a concise repository reference doc for the R2 and S3 flow

**Files:**
- Create: `docs/r2-storage-flow.md`

- [ ] **Step 1: Write the file skeleton**

```md
# R2 Storage Flow

## What this project does

## Upload path

## Public delivery path

## Environment variables
```

- [ ] **Step 2: Fill in the backend and storage explanation**

```md
## Upload path

1. Server-side code in `src/lib/publication.ts` creates assets for a target date.
2. `src/lib/storage.ts` creates an AWS `S3Client` pointed at `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`.
3. The AWS SDK uses `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` to sign the `PutObject` request.
4. Cloudflare R2 validates the signature and stores the object in `R2_BUCKET`.
```

- [ ] **Step 3: Fill in the public delivery explanation and variable glossary**

```md
## Public delivery path

1. After upload, the app constructs a browser URL from `R2_PUBLIC_BASE_URL`.
2. That public URL is stored in Postgres.
3. Public pages later render those URLs directly in the browser.

## Environment variables

- `R2_ACCOUNT_ID`: account-scoped identifier used to build the S3 API host
- `R2_ACCESS_KEY_ID`: access key for authenticated server-side uploads
- `R2_SECRET_ACCESS_KEY`: secret key paired with the access key
- `R2_BUCKET`: bucket where objects are written
- `R2_PUBLIC_BASE_URL`: public host that browsers use to fetch objects
```

- [ ] **Step 4: Review the file for alignment with current code paths**

Run: `sed -n '1,260p' docs/r2-storage-flow.md`

Expected: accurate references to `src/lib/publication.ts` and `src/lib/storage.ts`

- [ ] **Step 5: Commit the reference doc**

```bash
git add docs/r2-storage-flow.md
git commit -m "docs: add r2 storage flow reference"
```

### Task 5: Build the browser-first visual walkthrough in the active companion session

**Files:**
- Create: `.superpowers/brainstorm/65763-1777742722/content/flow-overview.html`
- Create: `.superpowers/brainstorm/65763-1777742722/content/authentication-flow.html`
- Create: `.superpowers/brainstorm/65763-1777742722/content/environment-variables.html`
- Create: `.superpowers/brainstorm/65763-1777742722/content/waiting.html`

- [ ] **Step 1: Add the overview screen with a component map**

```html
<h2>How One Verse Becomes Three R2 Objects</h2>
<p class="subtitle">From app code, to signed upload, to public browser delivery.</p>

<div class="mockup">
  <div class="mockup-header">Component map</div>
  <div class="mockup-body">
    <p>Browser → Next.js page → `src/lib/publication.ts` → `src/lib/storage.ts` → AWS SDK → Cloudflare R2 bucket → public `r2.dev` URL</p>
  </div>
</div>
```

- [ ] **Step 2: Add the authentication flow screen**

```html
<h2>Authentication Flow</h2>
<p class="subtitle">Only the server signs requests. The browser never sees the secret.</p>

<div class="mockup">
  <div class="mockup-header">Sequence</div>
  <div class="mockup-body">
    <p>1. App reads `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.</p>
    <p>2. AWS SDK signs a `PutObject` request for the R2 S3 endpoint.</p>
    <p>3. R2 verifies the signature before accepting the upload.</p>
    <p>4. Browser later fetches the public object using `R2_PUBLIC_BASE_URL` with no credentials.</p>
  </div>
</div>
```

- [ ] **Step 3: Add the environment-variable screen**

```html
<h2>Why There Are Two Different R2 Hosts</h2>
<p class="subtitle">One host is for authenticated upload traffic. The other is for public delivery.</p>

<div class="cards">
  <div class="card">
    <div class="card-body">
      <h3>S3 API host</h3>
      <p>`https://&lt;R2_ACCOUNT_ID&gt;.r2.cloudflarestorage.com`</p>
      <p>Used by server-side code and signed with access credentials.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h3>Public host</h3>
      <p>`R2_PUBLIC_BASE_URL`</p>
      <p>Used by browsers after upload is complete.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Add the terminal handoff screen**

```html
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">Continuing in terminal...</p>
</div>
```

- [ ] **Step 5: Open the browser screens one by one and confirm they load**

Run: write each HTML file into the active companion session and view `http://localhost:50408`

Expected: the browser shows the overview, authentication, and environment screens in sequence

- [ ] **Step 6: Commit the explainer screens if they belong in the repo state**

```bash
git add .superpowers/brainstorm/65763-1777742722/content
git commit -m "docs: add visual r2 walkthrough screens"
```

### Task 6: Run fresh verification before declaring completion

**Files:**
- Review only: `scripts/verify-r2-generation.ts`
- Review only: `README.md`
- Review only: `docs/r2-storage-flow.md`

- [ ] **Step 1: Run the full test-date generation verification**

Run: `npm run verify:r2-generation -- 2099-12-31`

Expected: PASS with `storageProvider: "r2"` and public URLs returned

- [ ] **Step 2: Verify one public object resolves successfully**

Run: `curl -I -sS "<one public URL from the verification output>"`

Expected: PASS with `HTTP/1.1 200 OK`

- [ ] **Step 3: Run the existing UI test file to catch accidental regressions**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: PASS with all tests green

- [ ] **Step 4: Re-read the spec and compare deliverables**

Run: `sed -n '1,260p' docs/superpowers/specs/2026-05-03-r2-verification-and-walkthrough-design.md`

Expected: every success criterion maps to a finished code or documentation artifact

- [ ] **Step 5: Commit the final integrated changes**

```bash
git add scripts/verify-r2-generation.ts package.json README.md docs/r2-storage-flow.md .superpowers/brainstorm/65763-1777742722/content
git commit -m "feat: verify r2 generation flow and document storage architecture"
```
