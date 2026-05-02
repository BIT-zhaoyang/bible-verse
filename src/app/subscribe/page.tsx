import type { Metadata } from "next";

import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SiteSubscribeCard } from "@/components/site-subscribe-card";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Prepare for future verse subscriptions and email preferences.",
};

const preferenceItems = [
  {
    title: "Verse of the Day",
    description: "Receive daily verse and explanation",
    enabled: true,
  },
  {
    title: "Weekly Encouragement",
    description: "Receive a weekly recap with encouragement",
    enabled: true,
  },
  {
    title: "Updates & News",
    description: "Receive updates about new features",
    enabled: false,
  },
];

export default function SubscribePage() {
  return (
    <div className="page-shell">
      <main className="site-main-shell">
        <SiteHeader currentPath="/subscribe" />

        <PageIntro
          eyebrow="Subscribe"
          title="Keep today&apos;s encouragement within reach"
          description="The email flow is still a placeholder, but the public experience is already shaped around a familiar American devotional habit: one verse, one reflection, one steady rhythm."
        />

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="overflow-hidden border-[rgba(84,60,37,0.1)] bg-[linear-gradient(180deg,rgba(243,229,212,0.86)_0%,rgba(252,246,239,0.9)_100%)]">
            <div className="flex aspect-[4/3] items-end p-8">
              <div className="max-w-sm space-y-3">
                <p className="public-section-label">Daily habit</p>
                <h2 className="font-display text-4xl font-semibold text-[color:var(--olive-ink)]">
                  Let one verse meet you wherever your day begins.
                </h2>
              </div>
            </div>
          </Card>
          <SiteSubscribeCard />
        </div>

        <Card className="public-band">
          <CardContent className="space-y-5 p-8">
            <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
              Email preferences
            </h2>
            <div className="space-y-4">
              {preferenceItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-[rgba(84,60,37,0.08)] bg-white/78 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-[color:var(--olive-ink)]">{item.title}</p>
                    <p className="text-sm text-[color:var(--muted-ink)]">{item.description}</p>
                  </div>
                  <div
                    className={`flex h-7 w-12 items-center rounded-full px-1 ${
                      item.enabled ? "bg-[color:var(--olive-ink)]" : "bg-[rgba(84,60,37,0.12)]"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white transition ${
                        item.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <SiteFooter />
      </main>
    </div>
  );
}
