import type { Metadata } from "next";

import { FeatureGrid } from "@/components/feature-grid";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Learn the mission behind Bible Daily Verse.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <main className="site-main-shell">
        <SiteHeader currentPath="/about" />

        <PageIntro
          eyebrow="About us"
          title="A quiet daily rhythm around Scripture"
          description="This site is built for believers who want one clear verse, one short reflection, and one gentle invitation to carry hope into the rest of the day."
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="overflow-hidden border-[rgba(84,60,37,0.1)] bg-[linear-gradient(180deg,rgba(255,248,241,0.88)_0%,rgba(242,228,210,0.84)_100%)]">
            <div className="flex aspect-[4/3] items-end p-8">
              <div className="max-w-sm space-y-3">
                <p className="public-section-label">Why it exists</p>
                <h2 className="font-display text-4xl font-semibold text-[color:var(--olive-ink)]">
                  Daily Scripture can still feel personal online.
                </h2>
              </div>
            </div>
          </Card>
          <Card className="public-band">
            <CardContent className="space-y-6 p-8">
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
                  Our mission
                </h2>
                <p className="text-base leading-8 text-[color:var(--muted-ink)]">
                  We believe Scripture has the power to transform lives, strengthen
                  faith, and bring hope to everyday moments. This site focuses on one
                  verse at a time so the message remains uncluttered and memorable.
                </p>
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
                  Why this format
                </h2>
                <p className="text-base leading-8 text-[color:var(--muted-ink)]">
                  By combining a short explanation, an image, and built-in sharing, the
                  experience stays devotional while also being easy to pass along to
                  friends, family, and church communities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <FeatureGrid />
        <SiteFooter />
      </main>
    </div>
  );
}
