# R2 Storage Flow

This repository uses one server-side upload path and one browser-facing delivery path for generated devotional assets.

## Two hosts, two purposes

| Purpose | Value | Used by |
| --- | --- | --- |
| Upload / S3 API host | `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` | Server-side authenticated uploads in `uploadR2()` |
| Browser / public host | `R2_PUBLIC_BASE_URL` | Browsers, social crawlers, and stored public asset URLs |

These are different on purpose. The S3-compatible host handles authenticated writes from the server. The browser-facing host is where public reads happen after the upload. If `R2_PUBLIC_BASE_URL` is missing, the code falls back to a derived `https://<bucket>.<account>.r2.cloudflarestorage.com/<key>` URL, but that is only a fallback produced by the code and not the intended public setup for browsers and social crawlers.

## Upload path

`src/lib/publication.ts` generates three assets for each candidate date:

- `sources/<date>/generation-<version>.svg`
- `cards/<date>/generation-<version>-simple.svg`
- `cards/<date>/generation-<version>-extended.svg`

Each asset is passed to `uploadAsset()` in `src/lib/storage.ts`.

- If `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` are present, `getR2Client()` builds an `S3Client` pointed at `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`.
- `uploadR2()` sends `PutObject` requests to `R2_BUCKET`.
- If that configuration is incomplete, `uploadLocal()` writes the same keys to `public/generated/...` instead.

Authentication is server-only on the upload path:

- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are used only by the server-side AWS SDK client.
- Browsers never receive those credentials.
- The app stores plain public URLs for later reads in page rendering and metadata.

## Public delivery path

After upload, `src/lib/storage.ts` stores a public URL on the generation row:

- R2 mode returns `<R2_PUBLIC_BASE_URL>/<key>` when `R2_PUBLIC_BASE_URL` is set.
- Otherwise it falls back to `https://<bucket>.<account>.r2.cloudflarestorage.com/<key>`.
- Local mode returns `<PUBLIC_SITE_URL>/generated/<key>`.

This means the fallback cases are distinct:

- Missing upload credentials or missing `R2_BUCKET` causes a local filesystem fallback.
- Missing only `R2_PUBLIC_BASE_URL` still writes to R2, but stores the derived bucket/account URL.

`R2_PUBLIC_BASE_URL` should already be publicly readable by browsers and social crawlers, because the app stores that URL directly for card rendering, Open Graph images, and Twitter images.

Those stored URLs are then used by:

- `src/app/page.tsx` for today's card and recent archive thumbnails
- `src/app/archive/page.tsx` for archive thumbnails
- `src/app/verse/[slug]/page.tsx` for the share page plus Open Graph and Twitter images

## Environment variable roles

- `R2_ACCOUNT_ID`: account-scoped identifier used to build the S3 API endpoint and default public fallback URL.
- `R2_ACCESS_KEY_ID`: upload credential for the server-side S3 client.
- `R2_SECRET_ACCESS_KEY`: secret paired with the access key.
- `R2_BUCKET`: bucket receiving generated source and card objects.
- `R2_PUBLIC_BASE_URL`: browser-facing base URL that should resolve publicly to the uploaded objects.
- `R2_REGION`: region passed to the AWS SDK client, defaulting to `auto` in `.env.example`.

## Verification reference

Run:

```bash
npm run verify:r2-generation -- 2099-12-31
```

`scripts/verify-r2-generation.ts` triggers a manual generation, reads back the newest `image_generations` row for that date, and prints the stored URLs so you can confirm whether the app used local storage or R2.

This command is not read-only:

- It creates a manual generation version.
- It creates and writes three generated assets for that date, either to R2 or to local storage depending on configuration.
- It writes database state for the chosen date.
- Use a disposable future date when verifying storage behavior.
