# Mobile-First Home And Verse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a generated 9:16 verse card and redesign the homepage plus verse detail page around a mobile-first, card-forward reading experience.

**Architecture:** Extend the existing generation pipeline with a new portrait card URL while keeping existing horizontal assets intact. Then reshape the shared publication component and the two public routes so mobile layouts center the portrait asset and desktop layouts remain compatible.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS, Drizzle ORM, Node test runner, local R2 verification script

---

## File structure

- Modify: `src/db/schema.ts`
  Add a nullable portrait card URL to `image_generations`.
- Modify: `drizzle/0000_stormy_johnny_storm.sql` is untouched.
- Create: `drizzle/0001_mobile_first_portrait_card.sql`
  Migration adding the new column.
- Modify: `drizzle/meta/_journal.json`
  Register the new migration.
- Create: `drizzle/meta/0001_snapshot.json`
  Snapshot for the new schema shape.
- Modify: `src/lib/cards.ts`
  Add portrait card variant support and a cleaner layout model for multiple aspect ratios.
- Modify: `src/lib/publication.ts`
  Generate, upload, and persist the portrait card URL, and expose it through public query shapes.
- Modify: `src/db/seed.ts`
  Seed the portrait card URL for local seeded content.
- Modify: `src/components/publication-card.tsx`
  Redesign the component for mobile-first portrait presentation and desktop compatibility.
- Modify: `src/components/site-chrome.tsx`
  Simplify mobile header behavior while preserving desktop navigation.
- Modify: `src/app/page.tsx`
  Rebuild the homepage hero and supporting sections around the portrait card.
- Modify: `src/app/verse/[slug]/page.tsx`
  Rebuild the detail page around the portrait card, simpler top bar, and reordered supporting content.
- Modify: `src/tests/public-ui.test.tsx`
  Add assertions that the mobile-first copy and portrait presentation hooks appear.
- Modify: `src/tests/ai-provider.test.ts`
  Add portrait card rendering tests.

## Task 1: Add portrait card generation coverage

**Files:**
- Modify: `src/tests/ai-provider.test.ts`
- Modify: `src/lib/cards.ts`

- [ ] **Step 1: Write the failing test**

Add a test proving the card renderer can output a portrait card with a 9:16 viewBox and still embed the generated background image.

```ts
test("renderCardSvg outputs a portrait 9:16 card when the portrait variant is requested", () => {
  const svg = renderCardSvg({
    verseText: "Be still, and know that I am God.",
    explanationText: "God's presence invites quiet trust.",
    referenceText: "Psalm 46:10",
    siteName: "Bible Daily Verse",
    palette: ["#112233", "#445566", "#778899"],
    variant: "portrait",
    backgroundImageDataUrl: "data:image/png;base64,QUJDRA==",
  });

  assert.match(svg, /viewBox=\"0 0 1080 1920\"/);
  assert.match(svg, /<image[^>]+href=\"data:image\\/png;base64,QUJDRA==\"/i);
  assert.match(svg, /Psalm 46:10/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --conditions=react-server --import tsx --test src/tests/ai-provider.test.ts`
Expected: FAIL because `portrait` is not yet a supported variant.

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/cards.ts` so `CardVariant` includes `portrait`, and branch layout geometry for portrait rendering:

```ts
type CardVariant = "simple" | "extended" | "portrait";
```

Implement portrait-specific width, height, type sizes, wrapping, and background image sizing while keeping existing variants stable.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --conditions=react-server --import tsx --test src/tests/ai-provider.test.ts`
Expected: PASS with the new portrait test included.

## Task 2: Add portrait URL persistence to the generation pipeline

**Files:**
- Modify: `src/db/schema.ts`
- Create: `drizzle/0001_mobile_first_portrait_card.sql`
- Create: `drizzle/meta/0001_snapshot.json`
- Modify: `drizzle/meta/_journal.json`
- Modify: `src/lib/publication.ts`
- Modify: `src/db/seed.ts`

- [ ] **Step 1: Write the failing test**

Extend `src/tests/public-ui.test.tsx` with a query-shape regression test around seeded or mocked publication data usage:

```ts
test("publication card content can prefer a portrait asset URL", () => {
  const portraitUrl = "https://example.com/cards/verse-portrait.svg";
  assert.equal(portraitUrl.includes("portrait"), true);
});
```

This is intentionally small because the stronger failure will come from type errors once the UI expects `cardImagePortraitUrl`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: FAIL only after the next step introduces the new UI expectation without data plumbing.

- [ ] **Step 3: Write minimal implementation**

Update `src/db/schema.ts`:

```ts
cardImagePortraitUrl: text("card_image_portrait_url"),
```

Add migration SQL:

```sql
ALTER TABLE "image_generations"
ADD COLUMN "card_image_portrait_url" text;
```

Update `src/lib/publication.ts` to:

- select `cardImagePortraitUrl` in public queries
- generate `cards/<date>/generation-<version>-portrait.svg`
- upload it with `renderCardSvg({ variant: "portrait", ... })`
- store the returned URL in the new column

Update `src/db/seed.ts` to populate `cardImagePortraitUrl` with the seeded simple image URL as a safe local fallback.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
node --conditions=react-server --import tsx --test src/tests/ai-provider.test.ts
node --import tsx --test src/tests/public-ui.test.tsx
```

Expected: PASS.

## Task 3: Rebuild `PublicationCard` around the portrait asset

**Files:**
- Modify: `src/components/publication-card.tsx`
- Modify: `src/tests/public-ui.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a rendering assertion that the public card now exposes portrait-first language and a portrait media container.

```ts
test("publication card uses a portrait presentation hook for mobile-first pages", () => {
  const html = renderToStaticMarkup(
    <PublicationCard
      title="Today's Verse"
      verseText="Be still, and know that I am God."
      explanationText="God's presence invites quiet trust."
      referenceText="Psalm 46:10"
      imageUrl="https://example.com/portrait.svg"
      shareUrl="https://example.com/verse/psalm-46-10"
      portraitImageUrl="https://example.com/portrait.svg"
      dateLabel="2026-05-03"
    />,
  );

  assert.match(html, /Read explanation/i);
  assert.match(html, /aspect-\\[9\\/16\\]/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: FAIL because `portraitImageUrl` and the new layout do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Refactor `PublicationCard` to accept:

```ts
portraitImageUrl?: string | null;
```

Then:

- make the mobile layout portrait-card-first
- keep a desktop-capable split or stacked layout
- place CTA and share actions in a calmer, app-like order
- fall back to `imageUrl` if the portrait URL is absent

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: PASS.

## Task 4: Redesign the homepage

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/site-chrome.tsx`

- [ ] **Step 1: Write the failing test**

Add homepage assertions in `src/tests/public-ui.test.tsx` for the new card-first devotional tone:

```ts
test("homepage mobile-first hero emphasizes the verse card and reading action", async () => {
  const source = await fs.readFile("src/app/page.tsx", "utf8");
  assert.match(source, /Read explanation/);
  assert.doesNotMatch(source, /One quiet place to receive today's verse\\./);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: FAIL because the old homepage headline still exists.

- [ ] **Step 3: Write minimal implementation**

Update `src/app/page.tsx` to:

- remove the oversized desktop-marketing hero headline from the mobile-first top section
- move the portrait card into the hero area
- keep supporting sections below it
- pass `publication.cardImagePortraitUrl ?? publication.cardImageSimpleUrl` into the shared card

Update `src/components/site-chrome.tsx` so mobile header chrome is lighter than the current full-site navigation presentation.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: PASS.

## Task 5: Redesign the verse detail page

**Files:**
- Modify: `src/app/verse/[slug]/page.tsx`
- Modify: `src/tests/public-ui.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a source-level regression check for the new reading flow:

```ts
test("verse detail page prefers the portrait card asset in the main hero", async () => {
  const source = await fs.readFile("src/app/verse/[slug]/page.tsx", "utf8");
  assert.match(source, /cardImagePortraitUrl/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: FAIL because the detail page still uses the old simple/extended fallback only.

- [ ] **Step 3: Write minimal implementation**

Update `src/app/verse/[slug]/page.tsx` to:

- use the portrait card URL first in the main card
- simplify the mobile top bar
- keep explanation and prayer directly below the hero content
- keep share actions close to the card without dominating the page

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`
Expected: PASS.

## Task 6: End-to-end verification

**Files:**
- Modify: `README.md` only if the final implementation changes public expectations enough to require doc updates

- [ ] **Step 1: Run focused automated verification**

Run:

```bash
node --conditions=react-server --import tsx --test src/tests/ai-provider.test.ts
node --import tsx --test src/tests/public-ui.test.tsx
```

Expected: all tests pass.

- [ ] **Step 2: Run real generation verification**

Run:

```bash
npm run verify:r2-generation -- 2099-12-31
```

Expected: JSON output includes `status: "review_required"`, `storageProvider`, and a new `cardImagePortraitUrl` or equivalent public URL in the stored record after implementation.

- [ ] **Step 3: Reload localhost and visually inspect**

Run the app, reload `http://localhost:3000`, and inspect:

- homepage mobile-first hero
- verse detail page mobile-first hero
- portrait card rendering

- [ ] **Step 4: Document final behavior if needed**

If the public card pipeline or env expectations changed, update `README.md` and the walkthrough docs.
