# Project Todo

Last updated: 2026-05-06

## Current priority

The first real end-to-end generation path is now verified. The current priority is no longer "make provider + R2 work"; it is to decide whether AI-provider-rendered scripture text is reliable enough for the product.

- [ ] Manually review the published 2026-05-03 generation 6 image.
  Check exact verse text, reference, cropping, readability, and visual tone.
- [ ] Generate 2-3 more recent dates with `AI_PROVIDER=openrouter` and `AI_PROVIDER_MODEL=openai/gpt-5.4-image-2`.
  Use these as a small quality sample before committing to this model route.
- [ ] Decide whether the main image strategy should stay "provider renders text" or return to "provider renders art only, site renders text outside the image."
- [ ] Add a lightweight generation QA step.
  Minimum: verify uploaded image exists, aspect ratio is close to 9:16, and all saved image URL fields point at the intended asset.
- [ ] Update the R2/image-generation walkthrough docs to match the current implementation.
  The older docs still describe the previous SVG composition flow.

## Deferred

These items remain intentionally postponed until the image-quality direction is stable:

- [ ] Add a global runtime AI settings record in the database so the app can switch provider and model without editing `.env.local`.
- [ ] Add an admin dashboard settings card with provider/model selectors and persist the choice for both manual generation and cron generation.
- [ ] Keep environment variables as fallback defaults when no runtime setting exists yet.
- [ ] Add automatic OCR/text-quality checks for AI-generated scripture images.
- [ ] Add a safe internal revalidation endpoint or script path so local scripted approvals do not require restarting the Next dev server.
- [ ] Regenerate older Recent/Archive dates to remove legacy mock or old SVG-composed images.

## Current config snapshot

The current local provider route is:

```env
AI_PROVIDER=openrouter
AI_PROVIDER_MODEL=openai/gpt-5.4-image-2
```

Credential state:

- `OPENROUTER_API_KEY` is configured locally.
- `OPENAI_API_KEY` is not configured locally, so direct `AI_PROVIDER=openai` generation is not currently runnable.
- R2 upload credentials and public base URL are configured locally.

## Notes

- The current published 2026-05-03 image is generation 6 and is stored in R2.
- Manual regeneration now reuses the already-published verse for the target date, so regenerating a date changes the image without silently changing the verse.
- The admin-switching work should affect future generations only. It should not rewrite or regenerate historical rows automatically.
