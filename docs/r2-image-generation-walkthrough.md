# R2 Image Generation Walkthrough

Chinese version: [r2-image-generation-walkthrough.zh-CN.md](/Users/bytedance/Work/bible-verse/docs/r2-image-generation-walkthrough.zh-CN.md)

This document explains, end to end, how this project generates image assets, decides where to store them, uploads them to Cloudflare R2, and later serves them back to browsers and social crawlers.

It is written as a teaching document, not just a reference note. The goal is that after reading it, you should be able to explain:

- how one generation run starts,
- where the image files are created,
- how the app decides between local storage and R2,
- what relationship Cloudflare R2 has to S3,
- why there are two different R2-related hosts,
- which environment variables matter at each step,
- what the verification command really does.

For a shorter reference version, see [r2-storage-flow.md](/Users/bytedance/Work/bible-verse/docs/r2-storage-flow.md).

## 1. What this app is doing

At a high level, this project is a devotional publishing app.

For a given date, it:

1. chooses one eligible Bible verse,
2. generates a source background image,
3. generates two shareable card images,
4. stores those assets,
5. saves the resulting public URLs in the database,
6. later uses those URLs on the public site and in social sharing metadata.

The most important business function is [`generateCandidateForDate()`](/Users/bytedance/Work/bible-verse/src/lib/publication.ts), defined in [src/lib/publication.ts](/Users/bytedance/Work/bible-verse/src/lib/publication.ts).

That function is the center of the whole pipeline.

## 2. Where a generation run starts

A generation run can start from a few places:

- the cron endpoint in [src/app/api/cron/generate-next/route.ts](/Users/bytedance/Work/bible-verse/src/app/api/cron/generate-next/route.ts),
- admin actions in [src/app/admin/actions.ts](/Users/bytedance/Work/bible-verse/src/app/admin/actions.ts),
- the verification script in [scripts/verify-r2-generation.ts](/Users/bytedance/Work/bible-verse/scripts/verify-r2-generation.ts).

These entry points do not themselves create image files or talk directly to R2. Instead, they decide a `targetDate`, then call the shared business logic in `generateCandidateForDate()`.

### Example: cron path

The cron route does two things:

1. marks today's approved item as published if appropriate,
2. asks the app to generate tomorrow's candidate.

That means the cron route is just a trigger. The real generation work still happens in `src/lib/publication.ts`.

## 3. What happens inside `generateCandidateForDate()`

Once `generateCandidateForDate(targetDate, triggerType)` starts, the flow looks like this:

1. It checks whether the target date already has a candidate in one of the protected states.
2. It selects an eligible verse for the date.
3. It computes the next `generationVersion`.
4. It inserts a new row in `image_generations`.
5. It updates that row from `pending` to `processing`.
6. It generates three SVG assets.
7. It stores those assets.
8. It updates the database row with URLs and final status.

The most important idea here is that this function manages both:

- business state in the database,
- file state in storage.

It is not only "generate images" code. It is an orchestration function.

## 4. Which database row gets created

The main record for one generation run lives in the `image_generations` table, defined in [src/db/schema.ts](/Users/bytedance/Work/bible-verse/src/db/schema.ts).

Important fields include:

- `targetDate`
- `provider`
- `providerModel`
- `promptSnapshot`
- `sourceImageUrl`
- `cardImageSimpleUrl`
- `cardImageExtendedUrl`
- `storageProvider`
- `status`
- `generationVersion`

This row is important because the app does not later recalculate the asset paths. It reads the saved URLs from the database.

That is why the database is part of the image pipeline, not just a side detail.

## 5. How the three image assets are created

For each generation run, the app currently creates three SVG files:

1. one source background asset,
2. one simple card,
3. one extended card.

### 5.1 Source background

This comes from [src/lib/ai.ts](/Users/bytedance/Work/bible-verse/src/lib/ai.ts).

Today, this file can either generate a deterministic local SVG background or call a real external AI image provider, depending on configuration.

So when you see fields like:

- `AI_PROVIDER`
- `AI_PROVIDER_MODEL`

they can now work in three modes:

- `AI_PROVIDER=mock`: local SVG background generation
- `AI_PROVIDER=openai`: real OpenAI image generation
- `AI_PROVIDER=openrouter`: real OpenRouter image generation

When `AI_PROVIDER=openai` and `AI_PROVIDER_MODEL` is not explicitly set, the app defaults to `gpt-image-2`.

When `AI_PROVIDER=openrouter` and `AI_PROVIDER_MODEL` is not explicitly set, the app defaults to `google/gemini-3.1-flash-image-preview` (Nano Banana 2).

In other words:

- the pipeline already supported a mock provider,
- and it can now call a real OpenAI or OpenRouter provider for the source background image.

### 5.2 Card images

The two card variants come from [src/lib/cards.ts](/Users/bytedance/Work/bible-verse/src/lib/cards.ts).

That file takes:

- `verseText`
- `explanationText`
- `referenceText`
- `siteName`
- `palette`
- `variant`

and turns them into SVG card markup.

The two variants are:

- `simple`
- `extended`

Their object keys look like:

- `cards/<date>/generation-<version>-simple.svg`
- `cards/<date>/generation-<version>-extended.svg`

The source background key looks like:

- `sources/<date>/generation-<version>.svg`

## 6. How the app decides where to store the files

This logic lives in [src/lib/storage.ts](/Users/bytedance/Work/bible-verse/src/lib/storage.ts).

The key exported function is:

- `uploadAsset()`

Internally, there are two storage paths:

- `uploadLocal()`
- `uploadR2()`

### 6.1 Local path

If upload configuration is incomplete, the app writes files under:

- `public/generated/...`

This makes the files available from the app's own public site URL.

### 6.2 R2 path

If the required upload variables are present, the app creates an S3-compatible client and writes the objects to Cloudflare R2 instead.

This is the most important branching rule:

- Missing upload credentials or missing `R2_BUCKET` -> local filesystem fallback
- Upload credentials and bucket present -> R2 upload path

## 7. What R2 and S3 have to do with each other

This is the concept that confuses most people at first.

### Short version

Cloudflare R2 is the storage service.

S3 is the API protocol the client speaks to that storage service.

### More precise version

This project uses the AWS SDK package:

- `@aws-sdk/client-s3`

but it is not uploading to AWS S3.

It is uploading to Cloudflare R2.

Why does that work?

Because R2 exposes an S3-compatible API. In practice, that means a client written for the S3 protocol can talk to R2 if you point it at the R2 endpoint.

Cloudflare's current documentation describes R2 as S3-compatible and documents the API endpoint as:

- `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

Official references:

- [Cloudflare R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)

So, in this repo:

- AWS SDK is the client library,
- S3 is the protocol shape,
- Cloudflare R2 is the actual object storage provider.

## 8. The most important distinction: two hosts, two purposes

This project uses two different R2-related hosts for two different jobs.

That is not an accident. It is the correct design.

### 8.1 Upload / S3 API host

This host is:

- `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

It is used by the server when uploading objects.

This is where the AWS SDK sends signed `PutObject` requests.

### 8.2 Browser / public host

This host is:

- `R2_PUBLIC_BASE_URL`

It is used after upload is already complete.

This is the host stored in the database and later consumed by:

- browsers,
- Open Graph crawlers,
- Twitter crawlers.

In this repository, that public host may currently be an `r2.dev` URL during development. Cloudflare's current documentation describes `r2.dev` as a public development URL and recommends using a custom domain for production-grade public delivery.

### Why this distinction matters

The upload host is for authenticated writes.

The public host is for later public reads.

If you confuse them, you end up with one of the classic setup mistakes:

- trying to use the S3 API endpoint as a browser URL,
- or assuming a public URL is enough for authenticated uploads.

They are different because the jobs are different.

## 9. What authentication actually happens during upload

Upload authentication happens only on the server side.

The browser is not involved.

Inside `src/lib/storage.ts`, the app builds an `S3Client` with:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_REGION`

Then it sends a `PutObject` request into the target bucket.

The important concept is this:

- the AWS SDK signs the request,
- R2 verifies the signature,
- if valid, R2 accepts the write.

That means the sensitive values:

- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

are server-only upload credentials.

They should never be sent to the browser.

## 10. What happens after upload succeeds

Once an upload finishes, the storage layer returns a result that includes:

- `provider`: either `local` or `r2`
- `url`: the browser-facing URL for that asset

Then `generateCandidateForDate()` writes those URLs back into the generation row:

- `sourceImageUrl`
- `cardImageSimpleUrl`
- `cardImageExtendedUrl`
- `storageProvider`

From that moment on, the rest of the app just reads these stored URLs.

No later page has to know how the file was uploaded.

In the current implementation, the generated background is also embedded into the final SVG cards, so the OpenAI-produced background can affect the actual simple and extended card images that users see.

That is a clean separation of concerns:

- generation and storage happen once,
- reading and display happen later.

## 11. Which pages later consume those URLs

The public pages that consume the stored URLs include:

- [src/app/page.tsx](/Users/bytedance/Work/bible-verse/src/app/page.tsx)
- [src/app/archive/page.tsx](/Users/bytedance/Work/bible-verse/src/app/archive/page.tsx)
- [src/app/verse/[slug]/page.tsx](/Users/bytedance/Work/bible-verse/src/app/verse/[slug]/page.tsx)

### Home page

The home page renders:

- today's card,
- recent archive thumbnails.

### Archive page

The archive page renders thumbnail images from stored card URLs.

### Verse detail page

This page is especially important because it uses stored image URLs in two ways:

1. for page content,
2. for Open Graph / Twitter metadata.

That means `R2_PUBLIC_BASE_URL` must not only be readable in a normal browser. It must also be readable by social crawlers.

## 12. What each R2-related environment variable does

This section explains not only each variable individually, but also how the variables depend on each other.

### `R2_ACCOUNT_ID`

Role:

- identifies the Cloudflare account,
- helps build the S3-compatible upload endpoint,
- is also used in the code's derived public fallback URL.

Relationship:

- it matters for upload host construction,
- it does not replace `R2_PUBLIC_BASE_URL`.

### `R2_ACCESS_KEY_ID`

Role:

- access credential used by the server-side SDK for upload authentication.

Relationship:

- it only matters together with `R2_SECRET_ACCESS_KEY`,
- it is never intended for browsers.

### `R2_SECRET_ACCESS_KEY`

Role:

- secret half of the upload credential pair,
- used to sign requests.

Relationship:

- must stay server-side,
- has no role in public reads.

### `R2_BUCKET`

Role:

- names the destination bucket that receives generated assets.

Relationship:

- if it is missing, the app cannot use the R2 upload path and falls back locally.

### `R2_PUBLIC_BASE_URL`

Role:

- defines the intended browser-facing base URL used after upload.

Relationship:

- independent from upload signing,
- required for clean public delivery,
- if missing, the app can still upload to R2 but stores a derived fallback URL instead.

### `R2_REGION`

Role:

- region passed into the S3 client configuration.

Relationship:

- for R2, this typically uses `auto`.

### `OPENAI_API_KEY`

Role:

- authenticates server-side requests to the OpenAI Images API when `AI_PROVIDER=openai`.

Relationship:

- only needed for the OpenAI provider path,
- must stay on the server,
- has no role in R2 upload authentication.

### `OPENROUTER_API_KEY`

Role:

- authenticates server-side requests to the OpenRouter image generation API when `AI_PROVIDER=openrouter`.

Relationship:

- only needed for the OpenRouter provider path,
- must stay on the server,
- has no role in R2 upload authentication.

## 13. How these variables work together

It is useful to think of the R2 variables as two groups.

### Group A: upload credentials and destination

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_REGION`

These are the variables that make authenticated writes possible.

### Group B: public delivery

- `R2_PUBLIC_BASE_URL`

This is the variable that makes the final stored URLs point at the host you actually want browsers to use.

### Operational outcomes

#### Case 1: all upload variables present, `R2_PUBLIC_BASE_URL` present

Result:

- uploads go to R2,
- stored URLs use your intended public host.

This is the desired setup.

#### Case 2: upload variables missing

Result:

- app falls back to local storage,
- files are written under `public/generated/...`.

#### Case 3: upload variables present, but `R2_PUBLIC_BASE_URL` missing

Result:

- uploads still go to R2,
- stored URLs use a derived bucket/account URL instead of your intended public host.

This can work, but it is not the clean intended production setup.

## 14. What the verification script actually does

The verification command is:

```bash
npm run verify:r2-generation -- 2099-12-31
```

Its implementation lives in [scripts/verify-r2-generation.ts](/Users/bytedance/Work/bible-verse/scripts/verify-r2-generation.ts).

This script is not read-only.

It really does the following:

1. accepts a target date,
2. triggers the real generation path using `manual_regenerate`,
3. creates a new generation version,
4. writes three generated assets,
5. reads the newest generation row back from the database,
6. prints JSON evidence describing what happened.

The output includes:

- `generationId`
- `generationVersion`
- `status`
- `storageProvider`
- `sourceImageUrl`
- `cardImageSimpleUrl`
- `cardImageExtendedUrl`
- `publicUrls`

Because it mutates storage and database state, it should be run against a disposable future date.

## 15. A concrete real example from this repository

During verification in this workspace, the command produced a run for:

- `2099-12-31`

and returned a generation with:

- `storageProvider: "r2"`

and public URLs like:

- `https://pub-...r2.dev/sources/2099-12-31/generation-3.svg`
- `https://pub-...r2.dev/cards/2099-12-31/generation-3-simple.svg`
- `https://pub-...r2.dev/cards/2099-12-31/generation-3-extended.svg`

That proves all of these layers worked together:

- generation logic,
- storage decision logic,
- authenticated R2 upload,
- public URL construction,
- public object access.

## 16. Common misconceptions

### “If I use the AWS S3 SDK, I must be using AWS S3”

False.

You can use an S3-compatible client library to talk to a non-AWS provider, as long as that provider exposes the compatible API.

### “If I have a public URL, I can upload to it”

False.

Public delivery URL and authenticated upload endpoint are different concerns.

### “If the browser can see the image, the browser must have the storage credentials”

False.

The browser only needs the final public URL. Upload credentials stay on the server.

### “The verification command is just a connectivity check”

False.

It creates a real generation version and writes real assets and database state.

## 17. If you want to trace this in code yourself

If you want to understand the pipeline by reading code in order, this is the best sequence:

1. [src/app/api/cron/generate-next/route.ts](/Users/bytedance/Work/bible-verse/src/app/api/cron/generate-next/route.ts)
2. [src/lib/publication.ts](/Users/bytedance/Work/bible-verse/src/lib/publication.ts)
3. [src/lib/ai.ts](/Users/bytedance/Work/bible-verse/src/lib/ai.ts)
4. [src/lib/cards.ts](/Users/bytedance/Work/bible-verse/src/lib/cards.ts)
5. [src/lib/storage.ts](/Users/bytedance/Work/bible-verse/src/lib/storage.ts)
6. [src/db/schema.ts](/Users/bytedance/Work/bible-verse/src/db/schema.ts)
7. [src/app/page.tsx](/Users/bytedance/Work/bible-verse/src/app/page.tsx)
8. [src/app/archive/page.tsx](/Users/bytedance/Work/bible-verse/src/app/archive/page.tsx)
9. [src/app/verse/[slug]/page.tsx](/Users/bytedance/Work/bible-verse/src/app/verse/[slug]/page.tsx)

## 18. One-sentence summary

This app generates three SVG assets for a date, uses server-side signed S3-compatible writes to store them in Cloudflare R2, saves browser-facing public URLs in the database, and later serves those URLs directly to pages and crawlers without ever exposing upload credentials to the browser.
