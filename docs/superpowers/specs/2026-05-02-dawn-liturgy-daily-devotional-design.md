# Dawn Liturgy Daily Devotional Design

## Goal

Refresh the public site so it feels like a credible American Christian daily devotional product instead of a generic SaaS-flavored content page. The design should lead with quiet spiritual focus, then support warm encouragement and easy sharing.

## Audience Fit

- Primary audience: English-speaking Christians in the United States who regularly consume verse-of-the-day, devotional, or encouragement content.
- Behavioral context: mobile-first, short reading sessions, frequent sharing to friends, family, church groups, and social feeds.
- Cultural fit target: closer to the emotional positioning of YouVersion verse-of-the-day and other evangelical daily devotional products than to magazine-style editorial design or formal liturgical church collateral.

## Direction

Use the `Dawn Liturgy` layout system as the visual foundation, then tune copy, CTA tone, spacing, and type scale to feel more familiar to U.S. devotional audiences.

This means:

- Keep: quiet pacing, generous whitespace, warm sunrise palette, elevated verse hero.
- Reduce: overly formal chapel / bulletin cues, overly austere typography, abstract editorial language.
- Add: clearer daily encouragement framing, more practical share prompts, stronger “today” rhythm.

## References and Constraints

- Product brief from `.trae` and `docs/prd-bible-daily-verse-v1.md` emphasizes:
  - one sitewide verse each day
  - warm, healing, low-friction reading experience
  - mobile-first reading and sharing
  - archive and detail pages as SEO landing pages
- Existing code already uses Next.js App Router, Tailwind v4, and shared UI primitives.
- This refresh should preserve current content model and routing; it is a visual and structural redesign, not a product scope change.

## Visual Principles

### 1. Daily Ritual First

The first screen should feel like opening a morning devotional. The verse is the center of gravity, not a generic hero headline about the product.

### 2. Gentle Warmth, Not Lifestyle Branding

The palette should feel sunlit, grounded, and comforting. It should avoid both cold monochrome SaaS styling and over-branded lifestyle aesthetics.

### 3. Contemporary Evangelical Tone

Buttons, microcopy, and supporting sections should feel current and approachable:

- “Today’s verse”
- “A little encouragement for today”
- “Share this verse with someone”

Avoid overly literary or overly formal framing.

### 4. Share-Friendly Without Breaking Calm

Sharing is important, but it should feel like a natural response to encouragement, not a growth hack.

### 5. Consistent Public-Site Language

Home, archive, detail, about, and subscribe should all feel like one devotional brand system.

## Visual System

### Color Palette

- `parchment`: warm page background
- `dawn`: pale sunrise highlight
- `olive-ink`: primary text and dark accent
- `clay`: warm action / share accent
- `mist`: soft card and divider surfaces

Usage guidance:

- Backgrounds should rely on layered gradients and soft glows rather than flat color fills.
- Primary text should use the darker olive/ink family instead of default slate.
- Warm accents should highlight encouragement and sharing, not dominate the page.

### Typography

- Display / verse / scripture references: expressive serif with spiritual warmth and readability
- Body / navigation / controls: clean sans serif with contemporary proportions

Tone guidance:

- The verse should read as the emotional focal point.
- Supporting copy should be calmer and slightly smaller than before.
- Large type should be used selectively so the page feels reverent, not loud.

### Surfaces

- Replace repeated identical white cards with a hierarchy of surfaces:
  - one prominent verse surface
  - lighter secondary information bands
  - minimal archive cards
- Corners, borders, and shadows should be softer and more atmospheric than product-like.

## Page-Level Design

### Home Page

Structure:

1. Soft floating header
2. Intro band with “today” context and mission
3. Elevated verse hero as the core experience
4. Small devotional explanation / rhythm section
5. Recent archive preview
6. Subscription encouragement section
7. Footer

Key changes:

- Remove the current generic marketing-style hero headline.
- Make the publication card itself the emotional centerpiece.
- Reframe utility sections as devotional guidance, not feature marketing.
- Keep archive preview visible but lighter than the main verse.

### Verse Detail Page

Structure:

1. Return link + date
2. Main verse presentation
3. Reflection / explanation / short prayer
4. Sharing encouragement
5. Subscription section

Key changes:

- Make the page feel like a calm reading continuation of the homepage.
- Reduce dashboard-like side content.
- Keep prayer and sharing, but present them in a softer devotional tone.

### Archive Page

Structure:

- Intro
- Light filter/search placeholder band
- Archive card grid with more breathable cards

Key changes:

- Treat archive as a library of encouragement, not a content management list.
- Emphasize date, reference, and verse excerpt with restrained imagery.

### About and Subscribe

Key changes:

- Reuse the same palette and spacing rhythm as the homepage.
- Present mission and subscribe value in the same devotional voice.
- Avoid looking like disconnected placeholder pages.

## Component Intent

### Header

- Floating, soft, lightly translucent
- Simple nav with current page awareness
- Should feel trustworthy and quiet, not corporate

### Publication Card

- The most important reusable component in the public site
- Must balance:
  - scripture authority
  - warmth
  - share-readiness
- The verse and reference should visually outrank the explanation and controls

### Share Buttons

- Preserve platform support
- Update copy to feel more invitational and less mechanical
- Primary action should suggest encouragement to others

### Subscribe Card

- Warm and hopeful, not form-heavy
- Should feel like “stay connected to this rhythm” rather than “join mailing list”

## Motion

- Use subtle entrance transitions and hover lifts only where they reinforce polish
- No flashy movement
- Motion should feel like settling, not bouncing

## Success Criteria

The redesign succeeds if:

- the homepage instantly communicates “one encouraging verse for today”
- the site feels plausible alongside U.S. Christian devotional products
- sharing remains obvious without making the site feel promotional
- archive and detail pages feel part of the same brand system
- the public site no longer reads as a generic template with religious content pasted in

## Self-Review

- Scope is intentionally limited to public-site UI refresh and shared styling.
- The direction stays aligned with the existing product brief and does not add new product features.
- The design intentionally balances devotional calm with mainstream evangelical usability rather than pushing fully liturgical or fully social-card aesthetics.
