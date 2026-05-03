import { BookOpen, CalendarDays } from "lucide-react";

import { ShareButtons } from "./share-buttons";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

type PublicationCardProps = {
  title: string;
  verseText: string;
  explanationText: string;
  referenceText: string;
  imageUrl: string | null;
  portraitImageUrl?: string | null;
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
  portraitImageUrl,
  shareUrl,
  dateLabel,
  variant = "hero",
}: PublicationCardProps) {
  const isDetail = variant === "detail";
  const displayImageUrl = portraitImageUrl ?? imageUrl;
  const summaryText = isDetail
    ? "Share, save, and sit with this verse for a while."
    : "Carry this verse with you and open the full reflection when you are ready.";

  return (
    <Card className="rise-in overflow-hidden border-[rgba(84,60,37,0.1)] bg-[rgba(255,250,244,0.92)] shadow-[0_28px_80px_rgba(97,70,40,0.12)]">
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1 text-sm text-[color:var(--muted-ink)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(156,104,68,0.12)] px-3 py-1 text-[color:var(--clay)]">
              <BookOpen className="h-4 w-4" />
              {title}
            </span>
            {dateLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/78 px-3 py-1.5 ring-1 ring-[rgba(84,60,37,0.08)]">
                <CalendarDays className="h-4 w-4" />
                {dateLabel}
              </span>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[32px] border border-[rgba(84,60,37,0.12)] bg-[linear-gradient(180deg,#f0dfc7_0%,#ead8c1_100%)] shadow-[0_20px_48px_rgba(97,70,40,0.14)]">
            <div className="aspect-[9/16]">
              {displayImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImageUrl}
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {!isDetail ? (
              <Button variant="default" size="lg" asChild>
                <a href={shareUrl}>Read explanation</a>
              </Button>
            ) : (
              <Button variant="secondary" size="lg" asChild>
                <a href="#verse-explanation">Go to explanation</a>
              </Button>
            )}
            <Button variant="secondary" size="lg" asChild>
              <a href={shareUrl}>Open verse page</a>
            </Button>
          </div>

          <div className="rounded-[28px] border border-[rgba(84,60,37,0.08)] bg-white/74 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--clay)]">
              {referenceText}
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-ink)]">
              {summaryText}
            </p>
          </div>
        </div>

        <CardContent className="grid gap-5 p-0">
          <div className="space-y-3 rounded-[30px] border border-[rgba(84,60,37,0.08)] bg-white/68 p-6">
            <p className="public-section-label">Today&apos;s reading</p>
            <h2 className="font-display text-[2.3rem] font-semibold leading-[0.98] text-[color:var(--olive-ink)] md:text-[3.4rem]">
              {referenceText}
            </h2>
            <blockquote
              className={`font-display leading-[1.05] text-[color:var(--olive-ink)] ${
                isDetail ? "text-[2.15rem] md:text-[3rem]" : "text-[2rem] md:text-[3.2rem]"
              }`}
            >
              “{verseText}”
            </blockquote>
          </div>

          <div className="space-y-3 rounded-[30px] border border-[rgba(84,60,37,0.08)] bg-white/58 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--clay)]">
              <CalendarDays className="h-4 w-4" />
              A little encouragement for today
            </div>
            <p className="max-w-2xl text-base leading-8 text-[color:var(--muted-ink)]">
              {explanationText}
            </p>
          </div>

          <div className="space-y-3 rounded-[30px] border border-[rgba(84,60,37,0.08)] bg-white/58 p-6">
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
        </CardContent>
      </div>
    </Card>
  );
}
