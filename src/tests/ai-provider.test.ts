import assert from "node:assert/strict";
import test from "node:test";

import { renderCardSvg } from "../lib/cards";
import { generateBackgroundForProvider } from "../lib/ai";
import { getDefaultAiProviderModel } from "../lib/config";

test("renderCardSvg embeds the provided background image data URL", () => {
  const svg = renderCardSvg({
    verseText: "The Lord is my shepherd; I shall not want.",
    explanationText: "A gentle reminder of provision and peace.",
    referenceText: "Psalm 23:1",
    siteName: "Bible Daily Verse",
    palette: ["#112233", "#445566", "#778899"],
    variant: "simple",
    backgroundImageDataUrl: "data:image/png;base64,QUJDRA==",
  });

  assert.match(svg, /<image[^>]+href="data:image\/png;base64,QUJDRA=="/i);
});

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

  assert.match(svg, /viewBox="0 0 1080 1920"/);
  assert.match(svg, /<image[^>]+href="data:image\/png;base64,QUJDRA=="/i);
  assert.match(svg, /Psalm 46:10/);
});

test("generateBackgroundForProvider returns png bytes for the openai provider", async () => {
  const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];

  const background = await generateBackgroundForProvider(
    {
      provider: "openai",
      model: "gpt-image-2",
      siteName: "Bible Daily Verse",
      openAiApiKey: "test-key",
    },
    "A peaceful shepherding landscape at sunrise.",
    async (url, init) => {
      fetchCalls.push({ url: String(url), init });

      return new Response(
        JSON.stringify({
          data: [
            {
              b64_json: Buffer.from("png-image-bytes").toString("base64"),
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    },
  );

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0]?.url, "https://api.openai.com/v1/images/generations");
  assert.equal(background.provider, "openai");
  assert.equal(background.model, "gpt-image-2");
  assert.equal(background.extension, "png");
  assert.equal(background.mediaType, "image/png");
  assert.equal(background.buffer.toString("utf8"), "png-image-bytes");
  assert.match(background.dataUrl, /^data:image\/png;base64,/);
});

test("generateBackgroundForProvider returns png bytes for the openrouter provider", async () => {
  const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
  const imageDataUrl = "data:image/png;base64," + Buffer.from("openrouter-image-bytes").toString("base64");

  const background = await generateBackgroundForProvider(
    {
      provider: "openrouter",
      model: "google/gemini-3.1-flash-image-preview",
      siteName: "Bible Daily Verse",
      openRouterApiKey: "test-openrouter-key",
    },
    "A golden field with a small chapel at dawn.",
    async (url, init) => {
      fetchCalls.push({ url: String(url), init });

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: "assistant",
                content: "Generated image.",
                images: [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageDataUrl,
                    },
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    },
  );

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0]?.url, "https://openrouter.ai/api/v1/chat/completions");
  const requestBody = JSON.parse(String(fetchCalls[0]?.init?.body ?? "{}"));
  assert.equal(requestBody.max_tokens, 256);
  assert.deepEqual(requestBody.modalities, ["image", "text"]);
  assert.equal(requestBody.image_config, undefined);
  assert.equal(background.provider, "openrouter");
  assert.equal(background.model, "google/gemini-3.1-flash-image-preview");
  assert.equal(background.extension, "png");
  assert.equal(background.mediaType, "image/png");
  assert.equal(background.buffer.toString("utf8"), "openrouter-image-bytes");
  assert.equal(background.dataUrl, imageDataUrl);
});

test("generateBackgroundForProvider retries OpenRouter once when the first response has no image data", async () => {
  let requestCount = 0;
  const imageDataUrl =
    "data:image/png;base64," + Buffer.from("retried-openrouter-image").toString("base64");

  const background = await generateBackgroundForProvider(
    {
      provider: "openrouter",
      model: "google/gemini-3.1-flash-image-preview",
      siteName: "Bible Daily Verse",
      openRouterApiKey: "test-openrouter-key",
    },
    "A hopeful mountain path with dawn light breaking through clouds.",
    async () => {
      requestCount += 1;

      if (requestCount === 1) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: null,
                },
                finish_reason: "error",
                native_finish_reason: "MALFORMED_FUNCTION_CALL",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: "assistant",
                content: "Generated image.",
                images: [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageDataUrl,
                    },
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    },
  );

  assert.equal(requestCount, 2);
  assert.equal(background.buffer.toString("utf8"), "retried-openrouter-image");
});

test("getDefaultAiProviderModel falls back to Nano Banana 2 for openrouter", () => {
  assert.equal(
    getDefaultAiProviderModel("openrouter"),
    "google/gemini-3.1-flash-image-preview",
  );
});
