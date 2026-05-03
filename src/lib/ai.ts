import "server-only";

import { createHash } from "crypto";

import { appConfig } from "./config";
import { escapeXml, wrapText } from "./text";

type GeneratedBackgroundExtension = "svg" | "png" | "jpeg" | "webp";

export type GeneratedBackground = {
  provider: string;
  model: string;
  buffer: Buffer;
  extension: GeneratedBackgroundExtension;
  mediaType: string;
  dataUrl: string;
};

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
};

function toDataUrl(mediaType: string, buffer: Buffer) {
  return `data:${mediaType};base64,${buffer.toString("base64")}`;
}

function createMockBackground(config: BackgroundProviderConfig, prompt: string): GeneratedBackground {
  const [first, second, third] = getPromptPalette(prompt);
  const lines = wrapText(prompt, 42).slice(0, 3);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
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
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#shade)" />
  <circle cx="960" cy="120" r="180" fill="rgba(255,255,255,0.09)" />
  <circle cx="180" cy="520" r="210" fill="rgba(255,255,255,0.06)" />
  <text x="90" y="108" fill="rgba(255,255,255,0.78)" font-size="26" font-family="Georgia, serif">Generated background preview</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="90" y="${170 + index * 38}" fill="rgba(255,255,255,0.72)" font-size="28" font-family="Georgia, serif">${escapeXml(
          line,
        )}</text>`,
    )
    .join("")}
  <text x="90" y="578" fill="rgba(255,255,255,0.80)" font-size="24" font-family="Arial, sans-serif">${escapeXml(
    config.siteName,
  )}</text>
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
      size: "1536x1024",
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

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

export async function generateBackground(prompt: string): Promise<GeneratedBackground> {
  return generateBackgroundForProvider(
    {
      provider: appConfig.aiProvider,
      model: appConfig.aiProviderModel,
      siteName: appConfig.siteName,
      openAiApiKey: process.env.OPENAI_API_KEY,
    },
    prompt,
  );
}
