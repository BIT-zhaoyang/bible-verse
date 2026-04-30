import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { PublicationCard } from "@/components/publication-card";
import { appConfig } from "@/lib/config";
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
  const today = getTodayDateKey();

  return (
    <div className="page-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
        <section className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Daily Bible Verse
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
                A shareable Bible verse for today, renewed every day.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {appConfig.siteName} offers one encouraging Scripture each day for
                English-speaking believers, paired with a gentle explanation and a
                ready-to-share card.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-300/70 bg-white/70 px-6 py-4 text-sm text-slate-700 shadow-sm">
              <p className="font-semibold text-slate-900">Today&apos;s date</p>
              <p>{today}</p>
            </div>
          </div>
        </section>

        {publication ? (
          <PublicationCard
            title="Today&apos;s Verse"
            verseText={publication.verseText}
            explanationText={publication.explanationText}
            referenceText={publication.referenceText}
            imageUrl={publication.cardImageSimpleUrl}
            shareUrl={`${appConfig.siteUrl}/verse/${publication.slug}`}
          />
        ) : (
          <section className="rounded-[2rem] border border-amber-300 bg-white/80 p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">
              Today&apos;s verse is not published yet
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
              The content pipeline is ready, but the current day still needs an
              approved publication. Sign in to the admin panel to generate or approve
              the next card.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Open admin
            </Link>
          </section>
        )}

        <section className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-[2rem] border border-slate-300/70 bg-white/70 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Built for daily return and easy sharing
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
              The homepage stays intentionally simple: one verse, one explanation, one
              visual. Users can return daily, browse the archive, and share the current
              verse to Facebook, X, and WhatsApp.
            </p>
          </div>
          <Link
            href="/archive"
            className="inline-flex h-fit rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm"
          >
            Browse archive
          </Link>
        </section>
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
