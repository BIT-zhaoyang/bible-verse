import { CheckCircle2 } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

const benefits = [
  "Daily encouragement delivered with one verse at a time",
  "Weekly encouragement recap for slower reflection",
  "New devotion features when they are ready",
];

export function SiteSubscribeCard() {
  return (
    <Card className="border-[rgba(84,60,37,0.1)] bg-[linear-gradient(180deg,rgba(243,229,212,0.92)_0%,rgba(248,240,229,0.86)_100%)]">
      <CardHeader className="gap-3 pb-2">
        <p className="public-section-label">
          Subscribe
        </p>
        <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
          Stay close to today&apos;s encouragement
        </h2>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--muted-ink)]">
          Start your day with God&apos;s Word and a little daily encouragement.
          Email delivery is still a placeholder, but the experience is designed for
          a future devotional rhythm.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input placeholder="Email address" type="email" />
          <Button className="md:min-w-40">Send me the verse</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-start gap-3 rounded-[1.5rem] border border-[rgba(84,60,37,0.08)] bg-white/78 px-4 py-4 text-sm text-[color:var(--muted-ink)]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--clay)]" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
