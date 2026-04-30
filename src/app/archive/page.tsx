import type { Metadata } from "next";
import Link from "next/link";

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
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Archive</p>
          <h1 className="text-4xl font-semibold text-slate-900">Past daily verses</h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            Explore previously published verses, each with a dedicated detail page and
            share-ready card.
          </p>
        </div>

        <div className="grid gap-4">
          {publications.map((publication) => (
            <Link
              key={`${publication.publishDate}-${publication.slug}`}
              href={`/verse/${publication.slug}`}
              className="rounded-[1.75rem] border border-slate-300/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                    {publication.publishDate}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {publication.referenceText}
                  </h2>
                  <p className="line-clamp-2 text-base leading-8 text-slate-600">
                    {publication.verseText}
                  </p>
                </div>
                <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Open detail
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-sm text-slate-500">
          {appConfig.siteName} stores each published verse for SEO, revisit, and
          sharing.
        </p>
      </main>
    </div>
  );
}
