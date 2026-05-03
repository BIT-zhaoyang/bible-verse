# Bible Daily Verse

Bible Daily Verse is a Next.js 16 devotional publishing app that selects one Scripture passage per day, generates shareable SVG card assets, stores those assets locally or in Cloudflare R2, and publishes the approved result to the home page, archive, and verse detail pages.

## What the app does

- `src/app/page.tsx` renders today's approved or published verse plus a short recent archive.
- `src/app/archive/page.tsx` lists previously published verses for revisit and sharing.
- `src/app/verse/[slug]/page.tsx` renders a shareable detail page and uses the stored card URL for Open Graph and Twitter metadata.
- `src/app/api/cron/generate-next/route.ts` is the scheduled entry point that marks today's approved item as published, then generates tomorrow's candidate.

The publication pipeline lives in `src/lib/publication.ts`:

1. Select an eligible verse for a target date.
2. Generate a background from the verse prompt in `src/lib/ai.ts`.
3. Render simple and extended SVG cards in `src/lib/cards.ts`.
4. Upload all three generated assets through `src/lib/storage.ts`.
5. Persist the resulting URLs so the app can display and share them.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment config:

```bash
cp .env.example .env.local
```

3. Start PostgreSQL and point `DATABASE_URL` at a writable local database.

4. Run the database setup:

```bash
npm run db:migrate
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

Core app configuration in `.env.example`:

- `DATABASE_URL`: Postgres connection used by Drizzle and the publishing pipeline.
- `SESSION_SECRET`: session signing secret for the admin experience.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: seeded admin credentials for local development.
- `PUBLIC_SITE_URL`: base URL used when building share and metadata links.
- `DEFAULT_TIMEZONE`: default publication timezone.
- `CRON_SECRET`: bearer token expected by `src/app/api/cron/generate-next/route.ts`.
- `AI_PROVIDER` and `AI_PROVIDER_MODEL`: control which background-image provider runs in `src/lib/ai.ts`. `mock` keeps the local SVG fallback; `openai` uses the OpenAI Images API, with `gpt-image-2` as the default model when `AI_PROVIDER_MODEL` is not explicitly set.
- `OPENAI_API_KEY`: required when `AI_PROVIDER=openai`.

R2 storage variables:

- `R2_ACCOUNT_ID`: used to build the Cloudflare S3-compatible endpoint.
- `R2_ACCESS_KEY_ID`: access key for authenticated uploads.
- `R2_SECRET_ACCESS_KEY`: secret key paired with the access key.
- `R2_BUCKET`: destination bucket name.
- `R2_PUBLIC_BASE_URL`: public base URL returned to browsers after upload.
- `R2_REGION`: AWS SDK region value for the S3 client. The example defaults to `auto`.

If any of `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, or `R2_BUCKET` are missing, `src/lib/storage.ts` falls back to writing files under `public/generated/...` and serves them from `PUBLIC_SITE_URL`.

### Two hosts, two purposes

| Purpose | Value | Used by |
| --- | --- | --- |
| Upload / S3 API host | `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` | Server-side authenticated uploads in `src/lib/storage.ts` |
| Browser / public host | `R2_PUBLIC_BASE_URL` | Browsers, share links, and social crawlers reading stored asset URLs |

The upload host is only for server-to-R2 `PutObject` traffic. The browser-facing host should be a public URL that already serves the uploaded objects. The code can derive a fallback public URL from bucket and account when `R2_PUBLIC_BASE_URL` is missing, but that derived URL is only a code fallback and should not be treated as the intended browser-facing setup.

### Authentication model

- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are server-only upload credentials.
- Browsers and social crawlers never receive those credentials.
- The app stores plain public asset URLs in the database for later reads.
- `R2_PUBLIC_BASE_URL` must already be publicly readable by browsers and crawlers that fetch Open Graph and Twitter images.

## How generation works

For cron-driven publishing, send a `POST` request to `/api/cron/generate-next` with `Authorization: Bearer <CRON_SECRET>`.

- `ensureTodayPublicationStatus()` publishes today's approved record when its date arrives.
- `generateCandidateForDate()` creates a new `image_generations` row unless the target date already has a candidate that is pending, processing, review-required, or approved.
- The source background is stored at `sources/<date>/generation-<version>.svg`.
- Share cards are stored at `cards/<date>/generation-<version>-simple.svg` and `cards/<date>/generation-<version>-extended.svg`.
- The stored URLs are later read by the public pages and by verse metadata generation.

## R2 verification

Use the repository verification script to exercise the generation pipeline for a future date and print the stored asset URLs:

```bash
npm run verify:r2-generation -- 2099-12-31
```

The script in `scripts/verify-r2-generation.ts` creates a manual generation for the requested date, reads back the latest generation row, and prints JSON including `storageProvider`, `sourceImageUrl`, `cardImageSimpleUrl`, `cardImageExtendedUrl`, and `publicUrls`.

This command is not read-only:

- It creates a manual generation version for the target date.
- It creates and writes three generated assets, either to R2 or to local storage depending on configuration.
- It writes `image_generations` state for that date.
- Use a disposable future date such as `2099-12-31`.

Fallback behavior is split in two ways:

- Missing upload credentials or bucket configuration causes a full local fallback to `public/generated/...`.
- Missing only `R2_PUBLIC_BASE_URL` still uploads to R2, but the app stores the derived bucket/account URL instead of your intended public host.

For a concise storage walkthrough, see [docs/r2-storage-flow.md](/Users/bytedance/Work/bible-verse/docs/r2-storage-flow.md).
