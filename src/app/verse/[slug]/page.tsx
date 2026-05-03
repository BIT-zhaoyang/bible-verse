import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { VerseDetailScreen } from "@/components/daily-app/screens";
import { appConfig } from "@/lib/config";
import { getPublicationBySlug } from "@/lib/publication";
import { getVerseDetailScreenData } from "@/lib/public-screen-data";

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
  const image =
    publication.cardImagePortraitUrl ??
    publication.cardImageSimpleUrl ??
    publication.cardImageExtendedUrl;

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
    <div className="min-h-screen bg-[#f4f3f1] px-6 py-10 text-center text-sm uppercase tracking-[0.24em] text-[#6b7280]">
      Loading verse...
    </div>
  );
}

async function VerseDetailContent({ params }: VerseDetailPageProps) {
  const { slug } = await params;
  const data = await getVerseDetailScreenData(slug);

  if (!data) {
    notFound();
  }

  return <VerseDetailScreen data={data} />;
}

export default function VerseDetailPage(props: VerseDetailPageProps) {
  return (
    <Suspense fallback={<VerseDetailFallback />}>
      <VerseDetailContent {...props} />
    </Suspense>
  );
}
