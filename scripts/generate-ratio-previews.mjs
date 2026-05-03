import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public/generated/previews/ratio-comparison");

const verseText = "The Lord is my shepherd; I shall not want.";
const explanationText =
  "A calm reminder that God provides what is needed, even when the path ahead feels uncertain.";
const referenceText = "Psalm 23:1";
const siteName = "Bible Daily Verse";
const prompt =
  "A peaceful shepherding landscape at sunrise, soft light over rolling hills, devotional atmosphere, hopeful and quiet.";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value, maxCharsPerLine) {
  const words = value.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function paletteFromPrompt(input) {
  const digest = crypto.createHash("sha256").update(input).digest("hex");

  return [
    `#${digest.slice(0, 6)}`,
    `#${digest.slice(6, 12)}`,
    `#${digest.slice(12, 18)}`,
  ];
}

const [first, second, third] = paletteFromPrompt(prompt);

const variants = [
  {
    name: "card-16x9.svg",
    ratioLabel: "16:9",
    width: 1600,
    height: 900,
    verseChars: 34,
    verseSize: 64,
    bodyChars: 50,
    bodySize: 28,
    labelSize: 26,
    refSize: 36,
    frameInset: 84,
    bodyLineLimit: 2,
  },
  {
    name: "card-4x5.svg",
    ratioLabel: "4:5",
    width: 1200,
    height: 1500,
    verseChars: 22,
    verseSize: 72,
    bodyChars: 28,
    bodySize: 30,
    labelSize: 26,
    refSize: 40,
    frameInset: 78,
    bodyLineLimit: 4,
  },
  {
    name: "card-9x16.svg",
    ratioLabel: "9:16",
    width: 1080,
    height: 1920,
    verseChars: 18,
    verseSize: 76,
    bodyChars: 22,
    bodySize: 32,
    labelSize: 28,
    refSize: 42,
    frameInset: 74,
    bodyLineLimit: 4,
  },
];

fs.mkdirSync(outDir, { recursive: true });

for (const variant of variants) {
  const {
    width,
    height,
    verseChars,
    verseSize,
    bodyChars,
    bodySize,
    labelSize,
    refSize,
    frameInset,
    ratioLabel,
    bodyLineLimit,
  } = variant;

  const innerX = frameInset;
  const innerY = frameInset;
  const innerW = width - frameInset * 2;
  const innerH = height - frameInset * 2;
  const verseLines = wrapText(verseText, verseChars);
  const bodyLines = wrapText(explanationText, bodyChars).slice(0, bodyLineLimit);
  const topLabelY = innerY + 56;
  const verseStartY =
    innerY + (ratioLabel === "16:9" ? 150 : ratioLabel === "4:5" ? 210 : 260);
  const verseGap = Math.round(verseSize * 1.28);
  const bodyStartY = verseStartY + verseLines.length * verseGap + (ratioLabel === "16:9" ? 48 : 76);
  const bodyGap = Math.round(bodySize * 1.45);
  const refY = innerY + innerH - 88;
  const footerY = height - 42;
  const accentY = ratioLabel === "16:9" ? height * 0.19 : ratioLabel === "4:5" ? height * 0.16 : height * 0.14;
  const cornerRadius = ratioLabel === "16:9" ? 34 : 42;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${first}" />
      <stop offset="55%" stop-color="${second}" />
      <stop offset="100%" stop-color="${third}" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(8, 15, 26, 0.08)" />
      <stop offset="100%" stop-color="rgba(8, 15, 26, 0.78)" />
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="18%" r="58%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.26)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#overlay)" />
  <circle cx="${width * 0.78}" cy="${accentY}" r="${Math.min(width, height) * 0.22}" fill="url(#glow)" />
  <circle cx="${width * 0.18}" cy="${height * 0.82}" r="${Math.min(width, height) * 0.18}" fill="rgba(255,255,255,0.07)" />
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${cornerRadius}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <text x="${innerX + 36}" y="${topLabelY}" fill="rgba(255,255,255,0.84)" font-size="${labelSize}" font-family="Arial, sans-serif">TODAY&apos;S VERSE · ${ratioLabel}</text>
  ${verseLines
    .map(
      (line, index) =>
        `<text x="${innerX + 36}" y="${verseStartY + index * verseGap}" fill="#ffffff" font-size="${verseSize}" font-family="Georgia, serif">${escapeXml(
          line,
        )}</text>`,
    )
    .join("")}
  ${bodyLines
    .map(
      (line, index) =>
        `<text x="${innerX + 36}" y="${bodyStartY + index * bodyGap}" fill="rgba(255,255,255,0.9)" font-size="${bodySize}" font-family="Arial, sans-serif">${escapeXml(
          line,
        )}</text>`,
    )
    .join("")}
  <text x="${innerX + 36}" y="${refY}" fill="#ffffff" font-size="${refSize}" font-family="Arial, sans-serif">${escapeXml(
    referenceText,
  )}</text>
  <text x="${width - 36}" y="${footerY}" text-anchor="end" fill="rgba(255,255,255,0.74)" font-size="22" font-family="Arial, sans-serif">${escapeXml(
    siteName,
  )}</text>
</svg>`;

  fs.writeFileSync(path.join(outDir, variant.name), svg);
}

console.log(outDir);
