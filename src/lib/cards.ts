import "server-only";

import { escapeXml, wrapText } from "./text";

type CardVariant = "simple" | "extended";

type CardInput = {
  verseText: string;
  explanationText: string;
  referenceText: string;
  siteName: string;
  palette: [string, string, string];
  variant: CardVariant;
  backgroundImageDataUrl?: string;
};

function buildTextLines(input: CardInput) {
  const verseLines = wrapText(input.verseText, 34).slice(0, 6);
  const explanationLines =
    input.variant === "extended"
      ? wrapText(input.explanationText, 48).slice(0, 3)
      : [];

  return { verseLines, explanationLines };
}

export function renderCardSvg(input: CardInput) {
  const { verseLines, explanationLines } = buildTextLines(input);
  const [first, second, third] = input.palette;
  const verseStartY = 192;
  const backgroundLayer = input.backgroundImageDataUrl
    ? `<image href="${escapeXml(
        input.backgroundImageDataUrl,
      )}" width="1200" height="630" preserveAspectRatio="xMidYMid slice" />`
    : `<rect width="1200" height="630" fill="url(#bg)" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${first}" />
      <stop offset="50%" stop-color="${second}" />
      <stop offset="100%" stop-color="${third}" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(8, 15, 26, 0.12)" />
      <stop offset="100%" stop-color="rgba(8, 15, 26, 0.72)" />
    </linearGradient>
  </defs>
  ${backgroundLayer}
  <rect width="1200" height="630" fill="url(#overlay)" />
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <text x="96" y="122" fill="rgba(255,255,255,0.86)" font-size="24" font-family="Arial, sans-serif">TODAY'S VERSE</text>
  ${verseLines
    .map(
      (line, index) =>
        `<text x="96" y="${verseStartY + index * 60}" fill="#ffffff" font-size="50" font-family="Georgia, serif">${escapeXml(
          line,
        )}</text>`,
    )
    .join("")}
  ${
    explanationLines.length
      ? explanationLines
          .map(
            (line, index) =>
              `<text x="96" y="${444 + index * 30}" fill="rgba(255,255,255,0.88)" font-size="24" font-family="Arial, sans-serif">${escapeXml(
                line,
              )}</text>`,
          )
          .join("")
      : ""
  }
  <text x="96" y="530" fill="#ffffff" font-size="30" font-family="Arial, sans-serif">${escapeXml(
    input.referenceText,
  )}</text>
  <text x="1104" y="580" text-anchor="end" fill="rgba(255,255,255,0.72)" font-size="20" font-family="Arial, sans-serif">${escapeXml(
    input.siteName,
  )}</text>
</svg>`;
}
