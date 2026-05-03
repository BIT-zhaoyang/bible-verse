# R2 Verification And Walkthrough Design

## Goal

Verify that the existing generation pipeline can upload real assets to Cloudflare R2 without affecting the live publishing schedule, then produce a browser-first teaching walkthrough that explains the complete backend, storage, authentication, and delivery flow in this project.

## Scope

This work has two deliverables:

1. A real pipeline verification run that uses a dedicated test date and confirms:
   - generation records can be created in the database,
   - source and card assets are uploaded to R2,
   - public URLs resolve successfully.
2. A learning package with:
   - a browser-based visual walkthrough,
   - a concise repository document summarizing setup, flow, and environment variables.

This work must not change the intended live cadence for today or tomorrow's publication records.

## Existing Context

The project already has most of the production-shaped pieces:

- `src/lib/publication.ts` chooses a verse, creates generation rows, renders SVG assets, uploads them through `uploadAsset()`, and records the resulting URLs.
- `src/lib/storage.ts` already supports two storage modes:
  - local filesystem output under `public/generated/...`,
  - Cloudflare R2 via the AWS S3 SDK when R2 environment variables are present.
- `src/lib/ai.ts` is currently a mock image/background provider that renders deterministic SVG output from the verse prompt.
- `src/app/api/cron/generate-next/route.ts` and admin actions already exercise the generation flow for real application dates.

The missing part is not storage support itself. The missing part is verified evidence that the full pipeline now works against real R2, plus developer-facing explanation of how the pieces fit together.

## Proposed Approach

### Approach A: Reuse the existing generation pipeline with a dedicated test date

Run the current `generateCandidateForDate()` logic against a test date that sits outside the normal active publishing cadence, then inspect the resulting database rows and uploaded URLs.

Pros:

- Verifies the exact code path the product already uses.
- Exercises verse selection, asset rendering, upload, and persistence in one pass.
- Minimizes new implementation surface.

Cons:

- Creates real records and objects that must be recognized as verification artifacts.
- Needs care when choosing the test date so it does not pollute live review flows.

### Approach B: Build a separate diagnostic upload script only

Create a dedicated script that uploads a sample asset to R2 and prints the resulting URL.

Pros:

- Very low risk to application state.
- Quick to run.

Cons:

- Does not verify the real generation path.
- Teaches less about how the app truly works.

### Recommendation

Use Approach A for pipeline verification and keep a small amount of read-only inspection around it. This gives us the best learning value and the strongest confidence that the current app path is wired correctly.

## Architecture

The work will keep the current application architecture intact and add explanation around it rather than redesigning it.

### Verification Architecture

1. Choose a dedicated test date.
2. Invoke the existing generation flow from server-side code.
3. Let the flow:
   - select a verse,
   - create an `image_generations` row,
   - render source and card SVG assets,
   - upload those assets through `uploadAsset()`,
   - persist returned URLs and storage provider metadata.
4. Inspect the resulting generation record and confirm:
   - `storageProvider` is `r2`,
   - URLs point at the configured public base URL,
   - uploaded objects are publicly reachable.

### Teaching Architecture

The primary teaching artifact will be a browser page that explains:

1. The application request and generation flow.
2. The distinction between:
   - the S3 API endpoint used by server code,
   - the public delivery URL used by browsers.
3. The role of each environment variable.
4. The authentication path:
   - app code holds credentials,
   - AWS SDK signs the request,
   - Cloudflare validates and stores the object,
   - browser later fetches public assets without credentials.

The repository document will summarize the same concepts in a shorter reference format.

## Components And File Responsibilities

- `src/lib/publication.ts`
  - source of truth for the generation and upload pipeline.
  - may only need a small helper or no change at all, depending on how we invoke the test-date run.
- `src/lib/storage.ts`
  - source of truth for R2 vs local storage behavior.
  - may receive small documentation-oriented cleanup if needed, but functional changes should be minimal.
- `README.md`
  - should be upgraded from template content to project-specific setup and storage guidance.
- `docs/`
  - will hold the concise written summary for future reference.
- `.superpowers/brainstorm/.../content/*.html`
  - will hold the browser-first visual explanation screens.

## Data Flow

### Runtime Flow

1. Server code starts with a target date.
2. A verse is selected from eligible content.
3. The app creates a generation row in Postgres.
4. The mock provider builds SVG bytes for the background and card assets.
5. `uploadAsset()` decides whether to use local storage or R2.
6. When R2 variables are present:
   - the AWS S3 client is instantiated with:
     - account-scoped endpoint,
     - access key id,
     - secret access key,
     - region `auto`.
7. The SDK signs a `PutObject` request.
8. Cloudflare R2 authenticates the request and stores the object in the named bucket.
9. The app constructs a public URL using `R2_PUBLIC_BASE_URL`.
10. The app stores those URLs in the generation row.
11. A browser later requests the public URL directly from Cloudflare's public delivery layer.

### Teaching Flow

1. The browser page will present the runtime flow as a sequence diagram and annotated component map.
2. The repository document will map each concept back to concrete project files and environment variables.

## Error Handling

Verification should clearly separate these failure modes:

- Missing configuration:
  - required R2 variables are absent.
- Upload transport failure:
  - DNS, networking, permission, or bucket access problems.
- Public delivery failure:
  - upload succeeds but public URL is not actually reachable.
- Data verification mismatch:
  - database row says `local` or points at the wrong base URL.

The verification output should make these distinctions explicit so the user can tell whether the problem is credentials, endpoint, bucket policy, or app logic.

## Testing And Verification Plan

The implementation must produce fresh evidence for:

1. Environment variables are present.
2. A test-date generation completes through the real app path.
3. Generated URLs are stored in the database and use the public R2 base URL.
4. At least one uploaded object is anonymously reachable with HTTP 200.
5. The documentation references the current project files accurately.

## Risks And Guardrails

- Do not run against today or tomorrow.
- Do not overwrite an approved or published live publication.
- Prefer a clearly labeled future or isolated test date.
- Keep visual teaching assets separate from production app pages.
- Avoid turning the teaching work into a product feature expansion.

## Success Criteria

This work is successful when all of the following are true:

- one real test-date generation has completed end to end,
- uploaded source and card assets are stored in R2,
- public URLs are reachable,
- the user can open a browser page that visually explains the full request, upload, and delivery lifecycle,
- the repository contains a concise written reference for future review.
