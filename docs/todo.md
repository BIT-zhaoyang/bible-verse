# Project Todo

## Current priority

The immediate goal is to run one real end-to-end image generation flow successfully:

- [ ] Choose the first live provider path to validate.
  Recommendation: start with `openrouter` plus a real `OPENROUTER_API_KEY`, because both the provider path and the default Nano Banana 2 model route are now implemented.
- [ ] Configure live credentials in `.env.local`.
  For OpenRouter, set `AI_PROVIDER=openrouter`, `OPENROUTER_API_KEY=...`, and optionally `AI_PROVIDER_MODEL=google/gemini-3.1-flash-image-preview` or `openai/gpt-5.4-image-2`.
- [ ] Run `npm run verify:r2-generation -- 2099-12-31` against the live provider.
- [ ] Confirm the new generation row stores `provider`, `providerModel`, `storageProvider`, and public asset URLs as expected.
- [ ] Open the generated public card URL and verify the final SVG really embeds the AI-generated background instead of the local gradient fallback.
- [ ] Review the result in the admin workflow before treating the provider path as production-ready.

## Deferred

These items are intentionally postponed until the first live generation flow is verified end to end:

- [ ] Add a global runtime AI settings record in the database so the app can switch provider and model without editing `.env.local`.
- [ ] Add an admin dashboard settings card with provider/model selectors and persist the choice for both manual generation and cron generation.
- [ ] Keep environment variables as fallback defaults when no runtime setting exists yet.

## Notes

- The admin-switching work should affect future generations only. It should not rewrite or regenerate historical rows automatically.
- The first milestone is not "multiple providers." The first milestone is "one real provider generates, uploads, stores, and displays a valid card through the full pipeline."
