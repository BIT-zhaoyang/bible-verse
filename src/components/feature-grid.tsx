import { BookOpenText, Lightbulb, Share2 } from "lucide-react";

import { Card, CardContent } from "./ui/card";

const features = [
  {
    title: "A calm place to begin your day",
    description:
      "One verse keeps the morning simple, so your attention stays on Scripture instead of scrolling.",
    icon: BookOpenText,
  },
  {
    title: "A little encouragement for today",
    description:
      "Each passage comes with a short reflection that feels clear, gentle, and easy to carry into the rest of your day.",
    icon: Lightbulb,
  },
  {
    title: "Share hope without extra friction",
    description:
      "Warm visual cards and familiar share actions make it easy to pass along a verse to family, friends, or your church group.",
    icon: Share2,
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.title} className="border-[rgba(84,60,37,0.1)] bg-[rgba(255,250,244,0.88)]">
          <CardContent className="flex flex-col gap-4 p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(156,104,68,0.12)] text-[color:var(--clay)]">
              <feature.icon className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <h3 className="font-display text-[1.7rem] font-semibold leading-tight text-[color:var(--olive-ink)]">
                {feature.title}
              </h3>
              <p className="text-sm leading-7 text-[color:var(--muted-ink)]">{feature.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
