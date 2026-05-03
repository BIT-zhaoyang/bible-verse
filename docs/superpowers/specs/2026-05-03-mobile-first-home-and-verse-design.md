# Mobile-First Home and Verse Detail Redesign

## Goal

Refit the public homepage and verse detail page around a phone-first reading experience that visually matches the user's preferred mobile concept: a calm devotional app feel, a strong 9:16 hero card, and simpler first-screen reading hierarchy.

## Scope

This redesign only covers:

- the public homepage at `src/app/page.tsx`
- the verse detail page at `src/app/verse/[slug]/page.tsx`
- the shared public-facing components those pages depend on
- the image generation pipeline required to produce a 9:16 card asset

This redesign explicitly does not cover:

- the archive page
- the about page
- the subscribe page
- the admin interface
- runtime provider selection in admin
- a bottom-tab app shell for the whole site

## Product direction

The site should behave like a mobile-first daily verse product, not like a desktop website compressed onto a narrow screen.

The guiding assumptions are:

- the primary audience is on phones
- the product is consumed in short daily sessions
- the first screen should feel devotional, calm, and immediately readable
- visual shareability matters, but reading still comes first

The user selected a card-forward homepage direction inspired by an AI-generated mobile concept. That means the public pages should feel closer to a devotional app than to a classic marketing homepage.

## Experience rules

### Homepage

On mobile:

- the first screen should be dominated by a 9:16 verse card
- the large desktop-style hero headline should be removed from the top of the page
- branding should remain present, but lighter and less site-navigation-heavy
- the main call to action should sit close to the card
- secondary modules such as "How it works", subscribe, and recent verses should remain below the hero area

On desktop:

- the page should remain comfortably web-native
- the 9:16 card should still be prominent, but it should live inside a composed two-column or stacked layout that does not feel like a phone mockup pasted onto desktop

### Verse detail page

On mobile:

- the first screen should start with a simplified top bar and a strong 9:16 card
- explanation and prayer content should sit directly below the card
- share actions should remain high on the page, but should not overpower the reading flow

On desktop:

- the page should preserve a rich reading layout
- the card remains prominent, but the page can continue using a split layout with supporting content beside or beneath it

## Visual direction

The new public pages should move toward these characteristics:

- strong portrait imagery
- a lighter, app-like top header
- softer chrome around content modules
- cleaner first-screen hierarchy
- fewer simultaneous choices in the hero area

The redesign should borrow the emotional direction of the user's reference image, not reproduce it literally. Existing site colors and typography may be refined, but they should stay within the current devotional visual language unless a change directly improves the mobile-first experience.

## Technical design

### New generated asset

The generation pipeline should produce a third card variant:

- `cardImagePortraitUrl` for the new 9:16 card

This asset should be stored alongside the existing simple and extended cards. Existing horizontal assets remain in place for compatibility.

### Data model

`image_generations` needs a new nullable column for the portrait card URL.

The public publication query shape should expose that field so homepage and verse detail layouts can choose the portrait asset first on mobile-oriented surfaces.

### Card rendering

`src/lib/cards.ts` should support a portrait layout variant that:

- uses a 9:16 canvas
- places the verse text high in the card
- supports readable type on narrow screens
- keeps the explanation inside the card short or absent depending on the chosen layout

The horizontal card variants should remain unchanged except for any safe internal refactoring needed to support multiple aspect ratios cleanly.

### Public components

`PublicationCard` should evolve from a single split desktop card into a component that can render:

- a mobile-first portrait hero treatment
- a detail-page portrait treatment
- a desktop-compatible layout that still feels coherent

The component should prefer the portrait card asset when available for the redesigned public pages, while still supporting fallback to the existing landscape asset.

### Header

The public header should be simplified on mobile:

- keep brand identity
- reduce visible navigation weight
- avoid the current full website nav bar occupying the top visual band

It is acceptable for desktop navigation to remain fuller than mobile navigation in this first pass.

## Content strategy

Homepage hero copy should shrink dramatically compared with the current large marketing-style heading.

The card itself becomes the primary message carrier. Supporting text outside the card should be minimal and devotional in tone.

The detail page should preserve the explanation and prayer sections, but their spacing and placement should feel more editorial and mobile-friendly.

## Testing strategy

The change should be validated through:

- unit tests for portrait card generation behavior
- public rendering tests for homepage and detail page component output where practical
- a real generation verification run to confirm the portrait asset is written to storage
- visual inspection in the in-app browser on localhost

## Risks

- adding a new card URL touches generation, storage, schema, and public rendering all at once
- portrait cards can become text-heavy if the layout is not carefully tuned
- a mobile-first hero can look oversized on desktop if the responsive rules are not balanced

## Success criteria

The redesign is successful when:

- the homepage and verse detail page feel phone-first
- the first screen visually matches the user's preferred card-forward concept
- the generation pipeline produces and stores a 9:16 card
- public pages can render the portrait card without breaking existing data
- desktop layouts remain usable and visually intentional
