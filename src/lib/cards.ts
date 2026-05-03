import "server-only";

import { escapeXml, wrapText } from "./text";

type CardVariant = "simple" | "extended" | "portrait";

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
  const verseLines =
    input.variant === "portrait"
      ? wrapText(input.verseText, 18).slice(0, 8)
      : wrapText(input.verseText, 34).slice(0, 6);
  const explanationLines =
    input.variant === "extended"
      ? wrapText(input.explanationText, 48).slice(0, 3)
      : [];

  return { verseLines, explanationLines };
}

export function renderCardSvg(input: CardInput) {
  const { verseLines, explanationLines } = buildTextLines(input);
  const [first, second, third] = input.palette;
  const width = input.variant === "portrait" ? 1080 : 1200;
  const height = input.variant === "portrait" ? 1920 : 630;
  const frameX = input.variant === "portrait" ? 56 : 64;
  const frameY = input.variant === "portrait" ? 56 : 64;
  const frameWidth = input.variant === "portrait" ? 968 : 1072;
  const frameHeight = input.variant === "portrait" ? 1808 : 502;
  const verseStartY = input.variant === "portrait" ? 270 : 192;
  const verseGap = input.variant === "portrait" ? 96 : 60;
  const verseFontSize = input.variant === "portrait" ? 76 : 50;
  const labelX = input.variant === "portrait" ? 94 : 96;
  const labelY = input.variant === "portrait" ? 142 : 122;
  const labelSize = input.variant === "portrait" ? 26 : 24;
  const referenceY = input.variant === "portrait" ? 1710 : 530;
  const referenceSize = input.variant === "portrait" ? 48 : 30;
  const footerX = input.variant === "portrait" ? 986 : 1104;
  const footerY = input.variant === "portrait" ? 1848 : 580;
  const footerSize = input.variant === "portrait" ? 24 : 20;
  const frameRadius = input.variant === "portrait" ? 40 : 28;
  const backgroundLayer = input.backgroundImageDataUrl
    ? `<image href="${escapeXml(
        input.backgroundImageDataUrl,
      )}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />`
    : `<rect width="${width}" height="${height}" fill="url(#bg)" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
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
  <rect width="${width}" height="${height}" fill="url(#overlay)" />
  <rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${frameHeight}" rx="${frameRadius}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <text x="${labelX}" y="${labelY}" fill="rgba(255,255,255,0.86)" font-size="${labelSize}" font-family="Arial, sans-serif">TODAY'S VERSE</text>
  ${verseLines
    .map(
      (line, index) =>
        `<text x="${labelX}" y="${verseStartY + index * verseGap}" fill="#ffffff" font-size="${verseFontSize}" font-family="Georgia, serif">${escapeXml(
          line,
        )}</text>`,
    )
    .join("")}
  ${
    explanationLines.length
      ? explanationLines
          .map(
            (line, index) =>
              `<text x="${labelX}" y="${444 + index * 30}" fill="rgba(255,255,255,0.88)" font-size="24" font-family="Arial, sans-serif">${escapeXml(
                line,
              )}</text>`,
          )
          .join("")
      : ""
  }
  <text x="${labelX}" y="${referenceY}" fill="#ffffff" font-size="${referenceSize}" font-family="Arial, sans-serif">${escapeXml(
    input.referenceText,
  )}</text>
  <text x="${footerX}" y="${footerY}" text-anchor="end" fill="rgba(255,255,255,0.72)" font-size="${footerSize}" font-family="Arial, sans-serif">${escapeXml(
    input.siteName,
  )}</text>
</svg>`;
}
