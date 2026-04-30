import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PublicationCard } from "@/components/publication-card";
import { appConfig } from "@/lib/config";
import { getPublicationBySlug } from "@/lib/publication";

type VerseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: VerseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);

  if (!publication) {
    return {
      title: "Verse not found",
    };
  }

  const url = `${appConfig.siteUrl}/verse/${publication.slug}`;
  const image = publication.cardImageSimpleUrl ?? publication.cardImageExtendedUrl;

  return {
    title: publication.referenceText,
    description: publication.explanationText,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: publication.referenceText,
      description: publication.explanationText,
      url,
      images: image ? [image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: publication.referenceText,
      description: publication.explanationText,
      images: image ? [image] : [],
    },
  };
}

function VerseDetailFallback() {
  return (
    <div className="page-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Loading verse...
        </p>
      </main>
    </div>
  );
}

async function VerseDetailContent({ params }: VerseDetailPageProps) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);

  if (!publication) {
    notFound();
  }

  return (
    <div className="page-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Verse Detail
            </p>
            <h1 className="text-4xl font-semibold text-slate-900">
              {publication.referenceText}
            </h1>
            <p className="text-sm text-slate-500">{publication.publishDate}</p>
          </div>
          <Link
            href="/archive"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm"
          >
            Back to archive
          </Link>
        </div>

        <PublicationCard
          title="Shared verse"
          verseText={publication.verseText}
          explanationText={publication.explanationText}
          referenceText={publication.referenceText}
          imageUrl={publication.cardImageExtendedUrl ?? publication.cardImageSimpleUrl}
          shareUrl={`${appConfig.siteUrl}/verse/${publication.slug}`}
        />
      </main>
    </div>
  );
}

export default function VerseDetailPage(props: VerseDetailPageProps) {
  return (
    <Suspense fallback={<VerseDetailFallback />}>
      <VerseDetailContent {...props} />
    </Suspense>
  );
}
