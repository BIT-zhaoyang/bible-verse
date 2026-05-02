import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/lib/config";
import { getArchivePublications } from "@/lib/publication";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse past daily Bible verses and shareable Scripture cards.",
};

export default async function ArchivePage() {
  const publications = await getArchivePublications();

  return (
    <div className="page-shell">
      <main className="site-main-shell">
        <SiteHeader currentPath="/archive" />

        <PageIntro
          eyebrow="Archive"
          title="An archive of daily encouragement"
          description="Revisit past verses whenever you want a familiar word of hope. Each page keeps its own shareable link so the encouragement can keep traveling."
        />

        <Card className="public-band">
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgba(107,90,73,0.6)]" />
              <Input
                placeholder="Search by verse or reference..."
                className="pl-11"
                disabled
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(84,60,37,0.12)] bg-white/86 px-4 py-2 text-sm font-medium text-[color:var(--muted-ink)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {publications.map((publication) => (
            <Link
              key={`${publication.publishDate}-${publication.slug}`}
              href={`/verse/${publication.slug}`}
              className="group"
            >
              <Card className="overflow-hidden border-[rgba(84,60,37,0.1)] bg-[rgba(255,250,244,0.88)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_24px_50px_rgba(97,70,40,0.12)]">
                <div className="aspect-[4/3] bg-[#e5ded5]">
                  {publication.cardImageSimpleUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={publication.cardImageSimpleUrl}
                      alt={publication.referenceText}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">
                    {publication.publishDate}
                  </p>
                  <h2 className="font-display text-2xl font-semibold leading-none text-[color:var(--olive-ink)]">
                    {publication.referenceText}
                  </h2>
                  <p className="line-clamp-2 text-sm leading-7 text-[color:var(--muted-ink)]">
                    {publication.verseText}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <p className="text-sm text-[color:var(--muted-ink)]">
          {appConfig.siteName} stores each published verse for SEO, revisit, and
          sharing.
        </p>

        <SiteFooter />
      </main>
    </div>
  );
}
