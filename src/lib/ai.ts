import "server-only";

import { createHash } from "crypto";

import { appConfig } from "./config";
import { escapeXml, wrapText } from "./text";

export type GeneratedBackground = {
  provider: string;
  model: string;
  buffer: Buffer;
  extension: "svg";
};

export function getPromptPalette(prompt: string): [string, string, string] {
  const digest = createHash("sha256").update(prompt).digest("hex");
  return [
    `#${digest.slice(0, 6)}`,
    `#${digest.slice(6, 12)}`,
    `#${digest.slice(12, 18)}`,
  ];
}

export async function generateBackground(prompt: string): Promise<GeneratedBackground> {
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
    appConfig.siteName,
  )}</text>
</svg>`;

  return {
    provider: appConfig.aiProvider,
    model: appConfig.aiProviderModel,
    buffer: Buffer.from(svg),
    extension: "svg",
  };
}
