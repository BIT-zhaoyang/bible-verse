import "server-only";

import { createHash } from "crypto";

import { appConfig } from "./config";

type GeneratedBackgroundExtension = "svg" | "png" | "jpeg" | "webp";

export type GeneratedBackground = {
  provider: string;
  model: string;
  buffer: Buffer;
  extension: GeneratedBackgroundExtension;
  mediaType: string;
  dataUrl: string;
};

export type VerseImagePromptInput = {
  siteName: string;
  referenceText: string;
  verseText: string;
  explanationText: string;
  promptText: string;
};

export function buildVerseImagePrompt(input: VerseImagePromptInput) {
  return [
    `Create one final image for ${input.siteName}.`,
    "Aspect ratio: 9:16 vertical portrait, mobile-first devotional artwork.",
    `Verse reference: ${input.referenceText}`,
    `Verse text: "${input.verseText}"`,
    `Short meaning: ${input.explanationText}`,
    `Visual direction: ${input.promptText}`,
    "Include readable scripture text in the image using the exact verse text above, and display the exact verse reference below it.",
    "Use elegant, high-contrast typography that remains legible on a mobile screen, with calm spacing and a devotional editorial layout.",
    "Keep generous safe margins on all sides. The verse text and reference must fit entirely inside the image without cropping, truncation, or text running off the edges.",
    "The image should feel reverent, calm, hopeful, and suitable for a daily Bible verse website and image sharing.",
    "Do not include logos, watermarks, UI controls, buttons, frames, phone mockups, website chrome, or extra captions beyond the verse text and reference.",
    "Return one final image only.",
  ].join("\n");
}

export function getPromptPalette(prompt: string): [string, string, string] {
  const digest = createHash("sha256").update(prompt).digest("hex");
  return [
    `#${digest.slice(0, 6)}`,
    `#${digest.slice(6, 12)}`,
    `#${digest.slice(12, 18)}`,
  ];
}

type BackgroundProviderConfig = {
  provider: string;
  model: string;
  siteName: string;
  openAiApiKey?: string;
  openRouterApiKey?: string;
};

function toDataUrl(mediaType: string, buffer: Buffer) {
  return `data:${mediaType};base64,${buffer.toString("base64")}`;
}

function createMockBackground(config: BackgroundProviderConfig, prompt: string): GeneratedBackground {
  const [first, second, third] = getPromptPalette(prompt);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${first}" />
      <stop offset="50%" stop-color="${second}" />
      <stop offset="100%" stop-color="${third}" />
    </linearGradient>
    <linearGradient id="shade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(10, 10, 10, 0.10)" />
      <stop offset="100%" stop-color="rgba(10, 10, 10, 0.55)" />
    </linearGradient>
    <radialGradient id="glow" cx="62%" cy="18%" r="58%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.34)" />
      <stop offset="62%" stop-color="rgba(255,255,255,0.08)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)" />
  <rect width="1080" height="1920" fill="url(#glow)" />
  <rect width="1080" height="1920" fill="url(#shade)" />
  <circle cx="840" cy="260" r="210" fill="rgba(255,255,255,0.10)" />
  <circle cx="220" cy="1530" r="280" fill="rgba(255,255,255,0.07)" />
  <path d="M0 1340 C210 1180 330 1260 500 1135 C690 995 850 1040 1080 880 L1080 1920 L0 1920 Z" fill="rgba(15,39,66,0.40)" />
  <path d="M0 1510 C260 1340 410 1450 620 1300 C780 1185 920 1205 1080 1095 L1080 1920 L0 1920 Z" fill="rgba(5,10,18,0.36)" />
</svg>`;

  const buffer = Buffer.from(svg);

  return {
    provider: config.provider,
    model: config.model,
    buffer,
    extension: "svg",
    mediaType: "image/svg+xml",
    dataUrl: toDataUrl("image/svg+xml", buffer),
  };
}

async function createOpenAiBackground(
  config: BackgroundProviderConfig,
  prompt: string,
  fetchImpl: typeof fetch,
): Promise<GeneratedBackground> {
  if (!config.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER is set to openai.");
  }

  const response = await fetchImpl("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      prompt,
      size: "1024x1536",
      quality: "medium",
      output_format: "png",
    }),
  });

  if (!response.ok) {
    const message = (await response.text()).trim();
    throw new Error(
      `OpenAI image generation failed (${response.status}): ${message || "No response body."}`,
    );
  }

  const payload = (await response.json()) as {
    data?: Array<{
      b64_json?: string;
    }>;
  };

  const b64Json = payload.data?.[0]?.b64_json;

  if (!b64Json) {
    throw new Error("OpenAI image generation response did not include image data.");
  }

  const buffer = Buffer.from(b64Json, "base64");

  return {
    provider: config.provider,
    model: config.model,
    buffer,
    extension: "png",
    mediaType: "image/png",
    dataUrl: toDataUrl("image/png", buffer),
  };
}

function parseImageDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,([\s\S]+)$/.exec(dataUrl);

  if (!match) {
    throw new Error("Image response did not include a supported base64 data URL.");
  }

  const mediaType = match[1];
  const base64Payload = match[2];
  const extension =
    mediaType === "image/png"
      ? "png"
      : mediaType === "image/jpeg"
        ? "jpeg"
        : mediaType === "image/webp"
          ? "webp"
          : "svg";

  return {
    mediaType,
    extension: extension as GeneratedBackgroundExtension,
    buffer: Buffer.from(base64Payload, "base64"),
    dataUrl,
  };
}

async function createOpenRouterBackground(
  config: BackgroundProviderConfig,
  prompt: string,
  fetchImpl: typeof fetch,
): Promise<GeneratedBackground> {
  if (!config.openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is required when AI_PROVIDER is set to openrouter.");
  }

  const requestBody: {
    model: string;
    messages: Array<{
      role: "user";
      content: string;
    }>;
    modalities: string[];
    image_config: {
      aspect_ratio: "9:16";
    };
    stream: boolean;
    max_tokens: number;
  } = {
    model: config.model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    modalities: ["image", "text"],
    image_config: {
      aspect_ratio: "9:16",
    },
    stream: false,
    max_tokens: 256,
  };

  async function requestImage(content: string) {
    const response = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openRouterApiKey}`,
      },
      body: JSON.stringify({
        ...requestBody,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      const message = (await response.text()).trim();
      throw new Error(
        `OpenRouter image generation failed (${response.status}): ${message || "No response body."}`,
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          images?: Array<{
            image_url?: {
              url?: string;
            };
            imageUrl?: {
              url?: string;
            };
          }>;
        };
      }>;
    };

    const firstImage = payload.choices?.[0]?.message?.images?.[0];
    return firstImage?.image_url?.url ?? firstImage?.imageUrl?.url ?? null;
  }

  const retryPrompt = `${prompt}\n\nGenerate a single final 9:16 vertical devotional image only. Include the exact verse text and verse reference as legible typography. Do not include logos, watermarks, buttons, or UI chrome. Do not call tools. Return image output.`;
  const imageDataUrl = (await requestImage(prompt)) ?? (await requestImage(retryPrompt));

  if (!imageDataUrl) {
    throw new Error("OpenRouter image generation response did not include image data.");
  }

  const parsed = parseImageDataUrl(imageDataUrl);

  return {
    provider: config.provider,
    model: config.model,
    buffer: parsed.buffer,
    extension: parsed.extension,
    mediaType: parsed.mediaType,
    dataUrl: parsed.dataUrl,
  };
}

export async function generateBackgroundForProvider(
  config: BackgroundProviderConfig,
  prompt: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeneratedBackground> {
  if (config.provider === "mock") {
    return createMockBackground(config, prompt);
  }

  if (config.provider === "openai") {
    return createOpenAiBackground(config, prompt, fetchImpl);
  }

  if (config.provider === "openrouter") {
    return createOpenRouterBackground(config, prompt, fetchImpl);
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

export async function generateBackground(prompt: string): Promise<GeneratedBackground> {
  return generateBackgroundForProvider(
    {
      provider: appConfig.aiProvider,
      model: appConfig.aiProviderModel,
      siteName: appConfig.siteName,
      openAiApiKey: process.env.OPENAI_API_KEY,
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
    },
    prompt,
  );
}
