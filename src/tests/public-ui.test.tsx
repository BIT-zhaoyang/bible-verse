import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FeatureGrid } from "../components/feature-grid";
import { ShareButtons } from "../components/share-buttons";
import { SiteSubscribeCard } from "../components/site-subscribe-card";

test("feature grid uses devotional rhythm language", () => {
  const html = renderToStaticMarkup(<FeatureGrid />);

  assert.match(html, /A calm place to begin your day/i);
});

test("share buttons invite the user to share this verse", () => {
  const html = renderToStaticMarkup(
    <ShareButtons
      title="Psalm 34:18"
      url="https://example.com/verse/psalm-34-18"
    />,
  );

  assert.match(html, /Share this verse/i);
});

test("subscribe card promises daily encouragement", () => {
  const html = renderToStaticMarkup(<SiteSubscribeCard />);

  assert.match(html, /daily encouragement/i);
});
