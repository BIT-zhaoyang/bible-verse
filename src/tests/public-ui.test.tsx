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
  assert.match(html, /Share with Others/);
  assert.match(html, /Was this verse meaningful to you/);
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
