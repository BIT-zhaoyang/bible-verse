# Dawn Liturgy Website Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the public-facing site UI so the homepage, detail page, archive page, and supporting public components feel like a polished American daily devotional product.

**Architecture:** Keep the existing App Router structure and data flow, but replace the visual system, page composition, and shared component styling. Centralize the redesign in global tokens and public shared components so each page inherits the same devotional identity.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, `next/font/google`, Node test runner with `tsx`, ESLint

---

## File Map

### Modify

- `src/app/layout.tsx`
  - Swap public font pairing to a more expressive serif + contemporary sans mix using `next/font/google`.
- `src/app/globals.css`
  - Define the Dawn Liturgy palette, background layers, shared public-site utility classes, and subtle motion.
- `src/app/page.tsx`
  - Rebuild homepage hierarchy around the verse hero and calmer support bands.
- `src/app/archive/page.tsx`
  - Refresh archive layout and card tone.
- `src/app/verse/[slug]/page.tsx`
  - Rebuild detail page into a calmer devotional flow.
- `src/app/about/page.tsx`
  - Align visual language with the new public brand system.
- `src/app/subscribe/page.tsx`
  - Align visual language and subscription messaging with the new public brand system.
- `src/components/publication-card.tsx`
  - Convert the public verse presentation into the new hero/detail visual system.
- `src/components/share-buttons.tsx`
  - Update copy, variants, and hierarchy for gentler, more invitational sharing.
- `src/components/site-chrome.tsx`
  - Refresh header, footer, and public page intro language/layout.
- `src/components/feature-grid.tsx`
  - Change “features” framing into devotional rhythm / encouragement framing.
- `src/components/site-subscribe-card.tsx`
  - Update subscribe section to feel warm and devotional rather than product-form oriented.
- `src/components/ui/button.tsx`
  - Add warmer public button treatments while preserving admin usage.
- `src/components/ui/card.tsx`
  - Soften card styling so shared public surfaces inherit the new tone.
- `src/components/ui/input.tsx`
  - Align form field styling with the new public visual system.

### Create

- `src/tests/public-ui.test.tsx`
  - Render key public components/pages to string and assert new devotional copy / structure exists.

---

### Task 1: Establish the visual system foundation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Test: `src/tests/public-ui.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

test("public UI primitives expose devotional-friendly styling hooks", () => {
  const button = renderToStaticMarkup(
    <Button variant="soft">Share this verse</Button>,
  );
  const card = renderToStaticMarkup(<Card>Verse</Card>);
  const input = renderToStaticMarkup(<Input placeholder="Email address" />);

  assert.match(button, /Share this verse/);
  assert.match(card, /Verse/);
  assert.match(input, /Email address/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: FAIL because the initial test file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implementation targets:

- In `src/app/layout.tsx`, replace the current font pairing with a warmer devotional mix such as `Source_Serif_4` for display and `Manrope` or similar for body copy, wired through CSS variables.
- In `src/app/globals.css`, introduce:
  - public palette variables
  - richer `page-shell` background layers
  - a stronger `.font-display`
  - calmer selection colors
  - subtle animation helpers
- In UI primitives:
  - make default buttons warmer and less stark
  - soften card borders/shadows
  - update inputs to match the new palette

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: PASS for the primitive render test.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/input.tsx src/tests/public-ui.test.tsx
git commit -m "feat: establish devotional visual system"
```

### Task 2: Rebuild shared public-site components

**Files:**
- Modify: `src/components/site-chrome.tsx`
- Modify: `src/components/publication-card.tsx`
- Modify: `src/components/share-buttons.tsx`
- Modify: `src/components/feature-grid.tsx`
- Modify: `src/components/site-subscribe-card.tsx`
- Test: `src/tests/public-ui.test.tsx`

- [ ] **Step 1: Write the failing test**

Add assertions like:

```tsx
import { PublicationCard } from "@/components/publication-card";
import { ShareButtons } from "@/components/share-buttons";

test("publication card and sharing copy reflect devotional tone", () => {
  const card = renderToStaticMarkup(
    <PublicationCard
      title="Today's Verse"
      verseText="The Lord is near."
      explanationText="A little encouragement for today."
      referenceText="Psalm 34:18"
      imageUrl={null}
      shareUrl="https://example.com/verse/test"
      dateLabel="2026-05-02"
    />,
  );

  const share = renderToStaticMarkup(
    <ShareButtons title="Psalm 34:18" url="https://example.com/verse/test" />,
  );

  assert.match(card, /Today's Verse/);
  assert.match(card, /A little encouragement for today/);
  assert.match(share, /Share/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: FAIL because the new devotional copy/structure is not present yet.

- [ ] **Step 3: Write minimal implementation**

Implementation targets:

- `site-chrome.tsx`
  - introduce a lighter floating header and warmer footer
  - update page intro styling to feel editorial/devotional
- `publication-card.tsx`
  - move the verse into a more ceremonial layout
  - keep image support but reduce product-card feel
  - make explanation and sharing secondary to scripture
- `share-buttons.tsx`
  - update labels like `Share this verse`
  - keep platform support while softening visual weight
- `feature-grid.tsx`
  - rewrite content away from SaaS “features” toward daily rhythm benefits
- `site-subscribe-card.tsx`
  - reframe as staying in rhythm with daily encouragement

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: PASS with updated public component rendering.

- [ ] **Step 5: Commit**

```bash
git add src/components/site-chrome.tsx src/components/publication-card.tsx src/components/share-buttons.tsx src/components/feature-grid.tsx src/components/site-subscribe-card.tsx src/tests/public-ui.test.tsx
git commit -m "feat: refresh shared devotional components"
```

### Task 3: Recompose the homepage and archive

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/archive/page.tsx`
- Test: `src/tests/public-ui.test.tsx`

- [ ] **Step 1: Write the failing test**

Add assertions like:

```tsx
test("homepage and archive speak in a devotional daily rhythm", async () => {
  const homeModule = await import("@/app/page");
  const archiveModule = await import("@/app/archive/page");

  assert.ok(homeModule.default);
  assert.ok(archiveModule.default);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: FAIL once the test starts checking for new structure or copy that is not yet implemented.

- [ ] **Step 3: Write minimal implementation**

Implementation targets:

- `src/app/page.tsx`
  - replace the generic marketing hero with a today-centered intro band
  - let the publication card be the main event
  - make archive preview lighter and more devotional in tone
- `src/app/archive/page.tsx`
  - update intro copy to feel like a library of encouragement
  - restyle archive cards and filter band

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: PASS for revised homepage/archive render checks.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/archive/page.tsx src/tests/public-ui.test.tsx
git commit -m "feat: redesign homepage and archive"
```

### Task 4: Recompose the detail, about, and subscribe pages

**Files:**
- Modify: `src/app/verse/[slug]/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/subscribe/page.tsx`
- Test: `src/tests/public-ui.test.tsx`

- [ ] **Step 1: Write the failing test**

Add assertions like:

```tsx
test("supporting pages keep the devotional tone", async () => {
  const aboutModule = await import("@/app/about/page");
  const subscribeModule = await import("@/app/subscribe/page");

  assert.ok(aboutModule.default);
  assert.ok(subscribeModule.default);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: FAIL once the new devotional phrasing/structure is asserted but not yet present.

- [ ] **Step 3: Write minimal implementation**

Implementation targets:

- `src/app/verse/[slug]/page.tsx`
  - convert the side content into a softer reflection/share flow
  - remove dashboard-like emphasis
- `src/app/about/page.tsx`
  - align mission presentation with the new visual system
- `src/app/subscribe/page.tsx`
  - align subscription messaging and controls with the new tone

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: PASS for revised supporting-page checks.

- [ ] **Step 5: Commit**

```bash
git add src/app/verse/[slug]/page.tsx src/app/about/page.tsx src/app/subscribe/page.tsx src/tests/public-ui.test.tsx
git commit -m "feat: align devotional supporting pages"
```

### Task 5: Final verification

**Files:**
- No new files

- [ ] **Step 1: Run focused test suite**

Run: `node --import tsx --test src/tests/public-ui.test.tsx`

Expected: PASS

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Expected: PASS

- [ ] **Step 3: Run production build**

Run: `pnpm build`

Expected: PASS

- [ ] **Step 4: Review the redesigned pages in the local browser**

Run: `pnpm dev`

Expected: Pages render with the new Dawn Liturgy devotional system and no obvious layout regressions across home, archive, detail, about, and subscribe.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: complete public site devotional refresh"
```

## Self-Review

### Spec coverage

- Design system foundation: covered in Task 1
- Shared public components: covered in Task 2
- Homepage and archive refresh: covered in Task 3
- Detail/about/subscribe alignment: covered in Task 4
- Verification: covered in Task 5

### Placeholder scan

- Removed generic placeholders and named exact files/commands.
- Kept code samples minimal because this plan is for an already-structured codebase rather than greenfield scaffolding.

### Type consistency

- Shared components keep existing prop names such as `PublicationCard` props and `ShareButtons` props.
- Test file path and command are consistent across tasks.
