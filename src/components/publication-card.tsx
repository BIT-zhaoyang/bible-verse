import { BookOpen, CalendarDays } from "lucide-react";

import { ShareButtons } from "./share-buttons";
import { Card, CardContent } from "./ui/card";

type PublicationCardProps = {
  title: string;
  verseText: string;
  explanationText: string;
  referenceText: string;
  imageUrl: string | null;
  shareUrl: string;
  dateLabel?: string;
  variant?: "hero" | "detail";
};

export function PublicationCard({
  title,
  verseText,
  explanationText,
  referenceText,
  imageUrl,
  shareUrl,
  dateLabel,
  variant = "hero",
}: PublicationCardProps) {
  const isDetail = variant === "detail";

  return (
    <Card className="rise-in overflow-hidden border-[rgba(84,60,37,0.1)] bg-[rgba(255,250,244,0.86)] shadow-[0_28px_80px_rgba(97,70,40,0.12)]">
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col gap-7 p-8 md:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted-ink)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(156,104,68,0.12)] px-3 py-1 text-[color:var(--clay)]">
              <BookOpen className="h-4 w-4" />
              {title}
            </span>
            {dateLabel ? (
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {dateLabel}
              </span>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="public-section-label">Today&apos;s reading</p>
              <h2 className="font-display text-4xl font-semibold leading-none text-[color:var(--olive-ink)] md:text-6xl">
                {referenceText}
              </h2>
            </div>
            <blockquote
              className={`font-display leading-[1.08] text-[color:var(--olive-ink)] ${
                isDetail ? "text-[2.4rem] md:text-[3.4rem]" : "text-[2.5rem] md:text-[4rem]"
              }`}
            >
              “{verseText}”
            </blockquote>
          </div>

          <div className="space-y-3 rounded-[1.6rem] border border-[rgba(84,60,37,0.08)] bg-white/58 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--clay)]">
              <CalendarDays className="h-4 w-4" />
              A little encouragement for today
            </div>
            <p className="max-w-2xl text-base leading-8 text-[color:var(--muted-ink)]">
              {explanationText}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted-ink)]">
              <BookOpen className="h-4 w-4" />
              Share this verse with someone who may need it
            </div>
            <ShareButtons
              title={`${referenceText} - ${verseText}`}
              url={shareUrl}
              compact={isDetail}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="min-h-[360px] bg-[linear-gradient(180deg,#f0dfc7_0%,#ead8c1_100%)] lg:min-h-full">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${referenceText} share card`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[color:var(--muted-ink)]">
                The share-ready verse card will appear here after generation and
                approval.
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
