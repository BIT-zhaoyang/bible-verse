import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ArchiveScreen,
  HomeScreen,
  ProfileScreen,
  VerseDetailScreen,
} from "../components/daily-app/screens";
import type {
  ArchiveScreenViewModel,
  HomeScreenViewModel,
  VerseCardViewModel,
  VerseDetailScreenViewModel,
} from "../components/daily-app/types";
import { DetailVerseImage, HomeVerseHero } from "../components/daily-app/verse-card";

const verse: VerseCardViewModel = {
  publishDate: "May 25, 2024",
  slug: "psalm-46-10",
  referenceText: "Psalm 46:10",
  verseText: "Be still, and know that I am God.",
  explanationText: "God invites us to pause and recognize His sovereignty.",
  sourceImageUrl: "https://example.com/source.png",
  portraitImageUrl: "https://example.com/portrait.svg",
  simpleImageUrl: "https://example.com/simple.svg",
  extendedImageUrl: "https://example.com/extended.svg",
  shareUrl: "https://example.com/verse/psalm-46-10",
};

test("home screen follows the mobile reference structure", () => {
  const data: HomeScreenViewModel = {
    today: "2026-05-03",
    verse,
    recent: [verse],
  };
  const html = renderToStaticMarkup(<HomeScreen data={data} />);

  assert.match(html, /Today&#x27;s Verse/);
  assert.match(html, /Read Explanation/);
  assert.match(html, /How It Works/);
  assert.match(html, /Get Verse of the Day in Your Inbox/);
  assert.match(html, /Recent Verses/);
  assert.match(html, /Archive/);
});

test("verse detail screen keeps image, explanation, prayer, and sharing sections", () => {
  const data: VerseDetailScreenViewModel = { verse };
  const html = renderToStaticMarkup(<VerseDetailScreen data={data} />);

  assert.match(html, /Share Image/);
  assert.match(html, /Download/);
  assert.match(html, /Explanation/);
  assert.match(html, /Prayer/);
  assert.doesNotMatch(html, /Share with Others/);
  assert.doesNotMatch(html, /Was this verse meaningful to you/);
});

test("verse artwork surfaces render the AI image without overlay text", () => {
  const homeHtml = renderToStaticMarkup(<HomeVerseHero verse={verse} />);
  const detailHtml = renderToStaticMarkup(<DetailVerseImage verse={verse} />);

  assert.match(homeHtml, /<img/);
  assert.match(homeHtml, /src="https:\/\/example\.com\/source\.png"/);
  assert.match(homeHtml, /href="https:\/\/example\.com\/source\.png"/);
  assert.match(homeHtml, /Share Image/);
  assert.doesNotMatch(homeHtml, /bg-black\/45/);
  assert.doesNotMatch(homeHtml, /drop-shadow/);
  assert.match(detailHtml, /<img/);
  assert.match(detailHtml, /src="https:\/\/example\.com\/source\.png"/);
  assert.match(detailHtml, /href="https:\/\/example\.com\/source\.png"/);
  assert.doesNotMatch(detailHtml, /bg-black\/45/);
  assert.doesNotMatch(detailHtml, /drop-shadow/);
});

test("home actions sit after the image instead of on top of it", () => {
  const homeHtml = renderToStaticMarkup(<HomeVerseHero verse={verse} />);
  const detailHtml = renderToStaticMarkup(<DetailVerseImage verse={verse} />);

  assert.ok(homeHtml.indexOf("<img") < homeHtml.indexOf("Read Explanation"));
  assert.ok(homeHtml.indexOf("Read Explanation") < homeHtml.indexOf("Share Image"));
  assert.ok(detailHtml.indexOf("<img") < detailHtml.indexOf("Share Image"));
  assert.doesNotMatch(detailHtml, /text-center/);
});

test("verse detail keeps one share action area and avoids duplicate engagement sections", () => {
  const data: VerseDetailScreenViewModel = { verse };
  const html = renderToStaticMarkup(<VerseDetailScreen data={data} />);

  assert.match(html, /Share Image/);
  assert.doesNotMatch(html, /Share with Others/);
  assert.doesNotMatch(html, /Was this verse meaningful to you/);
  assert.doesNotMatch(html, /Facebook/);
  assert.doesNotMatch(html, /WhatsApp/);
});

test("archive screen exposes search, filter, month grouping, and load more", () => {
  const data: ArchiveScreenViewModel = {
    monthLabel: "May 2024",
    publications: [verse],
  };
  const html = renderToStaticMarkup(<ArchiveScreen data={data} />);

  assert.match(html, /Verse Archive/);
  assert.match(html, /Search by keyword or reference/);
  assert.match(html, /Filter/);
  assert.match(html, /May 2024/);
  assert.match(html, /Load More/);
});

test("profile screen mirrors the settings and email preferences page", () => {
  const html = renderToStaticMarkup(<ProfileScreen />);

  assert.match(html, /Settings/);
  assert.match(html, /Email Preferences/);
  assert.match(html, /Verse of the Day/);
  assert.match(html, /Weekly Encouragement/);
});

test("public routes are thin data-to-screen adapters", async () => {
  const [homeSource, detailSource, archiveSource] = await Promise.all([
    readFile("src/app/page.tsx", "utf8"),
    readFile("src/app/verse/[slug]/page.tsx", "utf8"),
    readFile("src/app/archive/page.tsx", "utf8"),
  ]);

  assert.match(homeSource, /getHomeScreenData/);
  assert.match(homeSource, /<HomeScreen data=\{data\}/);
  assert.doesNotMatch(homeSource, /PublicationCard/);
  assert.match(detailSource, /getVerseDetailScreenData/);
  assert.match(detailSource, /cardImagePortraitUrl/);
  assert.match(archiveSource, /getArchiveScreenData/);
  assert.doesNotMatch(archiveSource, /SiteHeader/);
});

test("publication generation stores the AI provider image directly", async () => {
  const source = await readFile("src/lib/publication.ts", "utf8");

  assert.doesNotMatch(source, /renderCardSvg/);
  assert.doesNotMatch(source, /generation-\\$\\{generationVersion\\}-portrait\\.svg/);
  assert.match(source, /cardImagePortraitUrl: imageUpload\.url/);
  assert.match(source, /cardImageSimpleUrl: imageUpload\.url/);
  assert.match(source, /cardImageExtendedUrl: imageUpload\.url/);
  assert.match(source, /selectVerseForGeneration/);
  assert.match(source, /triggerType === "manual_regenerate"/);
});
