import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { FeatureGrid } from "@/components/feature-grid";
import { PublicationCard } from "@/components/publication-card";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SiteSubscribeCard } from "@/components/site-subscribe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appConfig } from "@/lib/config";
import { getArchivePublications } from "@/lib/publication";
import { getTodayPublication } from "@/lib/publication";
import { getTodayDateKey } from "@/lib/time";

function HomeFallback() {
  return (
    <div className="page-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Loading today&apos;s verse...
        </p>
      </main>
    </div>
  );
}

async function HomeContent() {
  await connection();

  const publication = await getTodayPublication();
  const archive = await getArchivePublications();
  const today = getTodayDateKey();
  const recent = archive.slice(0, 4);

  return (
    <div className="page-shell">
      <main className="site-main-shell">
        <SiteHeader currentPath="/" />

        <section className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-4">
            <p className="public-section-label">
              Daily Bible Verse
            </p>
            <h1 className="font-display text-5xl font-semibold leading-none text-[color:var(--olive-ink)] md:text-7xl">
              One quiet place to receive today&apos;s verse.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[color:var(--muted-ink)]">
              {appConfig.siteName} offers one encouraging Scripture each day for
              English-speaking believers, paired with a gentle reflection and a
              share-ready card you can pass along in seconds.
            </p>
          </div>
          <Card className="public-band">
            <CardContent className="p-5 text-sm text-[color:var(--muted-ink)]">
              <div className="flex items-center gap-2 font-medium text-[color:var(--clay)]">
                <Sparkles className="h-4 w-4" />
                Today&apos;s rhythm
              </div>
              <p className="mt-2 font-display text-2xl text-[color:var(--olive-ink)]">{today}</p>
            </CardContent>
          </Card>
        </section>

        {publication ? (
          <PublicationCard
            title="Today&apos;s Verse"
            verseText={publication.verseText}
            explanationText={publication.explanationText}
            referenceText={publication.referenceText}
            imageUrl={publication.cardImageSimpleUrl}
            shareUrl={`${appConfig.siteUrl}/verse/${publication.slug}`}
            dateLabel={today}
          />
        ) : (
          <section className="public-band p-8">
            <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
              Today&apos;s verse is not published yet
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--muted-ink)]">
              The content pipeline is ready, but the current day still needs an
              approved publication. Sign in to the admin panel to generate or approve
              the next card.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/admin">Open admin</Link>
            </Button>
          </section>
        )}

        <section className="public-band space-y-6 p-7 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="public-section-label">
                Daily rhythm
              </p>
              <h2 className="font-display text-4xl font-semibold text-[color:var(--olive-ink)]">
                A calmer way to meet Scripture each day
              </h2>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/about">Learn more</Link>
            </Button>
          </div>
          <FeatureGrid />
        </section>

        <SiteSubscribeCard />

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="public-section-label">
                Recent verses
              </p>
              <h2 className="font-display text-4xl font-semibold text-[color:var(--olive-ink)]">
                Keep a few recent verses close
              </h2>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/archive">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {recent.map((item) => (
              <Link key={`${item.publishDate}-${item.slug}`} href={`/verse/${item.slug}`}>
                <Card className="overflow-hidden border-[rgba(84,60,37,0.1)] bg-[rgba(255,250,244,0.88)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(97,70,40,0.12)]">
                  <div className="aspect-[4/3] bg-[#e9decf]">
                    {item.cardImageSimpleUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.cardImageSimpleUrl}
                        alt={item.referenceText}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">
                      {item.publishDate}
                    </p>
                    <h3 className="font-display text-2xl font-semibold leading-none text-[color:var(--olive-ink)]">
                      {item.referenceText}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
