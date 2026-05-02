import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Heart } from "lucide-react";

import { PublicationCard } from "@/components/publication-card";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SiteSubscribeCard } from "@/components/site-subscribe-card";
import { ShareButtons } from "@/components/share-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <main className="site-main-shell">
        <SiteHeader currentPath="" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <p className="text-sm text-[color:var(--muted-ink)]">{publication.publishDate}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <PublicationCard
            title="Shared verse"
            verseText={publication.verseText}
            explanationText={publication.explanationText}
            referenceText={publication.referenceText}
            imageUrl={publication.cardImageExtendedUrl ?? publication.cardImageSimpleUrl}
            shareUrl={`${appConfig.siteUrl}/verse/${publication.slug}`}
            dateLabel={publication.publishDate}
            variant="detail"
          />

          <div className="space-y-6">
            <Card className="public-band">
              <CardHeader>
                <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
                  Sit with this verse for a moment
                </h2>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-7 text-[color:var(--muted-ink)]">
                <p>{publication.explanationText}</p>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-semibold text-[color:var(--olive-ink)]">
                    Prayer
                  </h3>
                  <p>
                    Lord, help me to rest in Your truth and receive this verse with
                    humility, peace, and courage for today. Amen.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[rgba(84,60,37,0.1)] bg-[rgba(255,250,244,0.88)]">
              <CardHeader>
                <h2 className="font-display text-3xl font-semibold text-[color:var(--olive-ink)]">
                  Pass this encouragement along
                </h2>
              </CardHeader>
              <CardContent className="space-y-5">
                <ShareButtons
                  title={`${publication.referenceText} - ${publication.verseText}`}
                  url={`${appConfig.siteUrl}/verse/${publication.slug}`}
                  compact
                />
                <div className="rounded-[24px] border border-[rgba(156,104,68,0.12)] bg-[rgba(249,236,220,0.92)] px-4 py-4 text-sm text-[color:var(--muted-ink)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(156,104,68,0.12)] text-[color:var(--clay)]">
                        <Heart className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-[color:var(--olive-ink)]">
                          Was this verse meaningful to you?
                        </p>
                        <p>Let others know and encourage someone else today.</p>
                      </div>
                    </div>
                    <Button variant="soft" size="sm">
                      Encourage someone
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <SiteSubscribeCard />
        <SiteFooter />
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
