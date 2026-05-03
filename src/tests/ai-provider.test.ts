import assert from "node:assert/strict";
import test from "node:test";

import { renderCardSvg } from "../lib/cards";
import { generateBackgroundForProvider } from "../lib/ai";

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
