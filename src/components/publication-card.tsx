import { ShareButtons } from "./share-buttons";

type PublicationCardProps = {
  title: string;
  verseText: string;
  explanationText: string;
  referenceText: string;
  imageUrl: string | null;
  shareUrl: string;
};

export function PublicationCard({
  title,
  verseText,
  explanationText,
  referenceText,
  imageUrl,
  shareUrl,
}: PublicationCardProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-[#0f1a2e] text-white shadow-2xl">
      <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6 p-8 md:p-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">
              {title}
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              {referenceText}
            </h1>
          </div>
          <blockquote className="text-xl leading-9 text-white/92 md:text-2xl">
            “{verseText}”
          </blockquote>
          <p className="max-w-2xl text-base leading-8 text-slate-200">
            {explanationText}
          </p>
          <ShareButtons title={`${referenceText} - ${verseText}`} url={shareUrl} />
        </div>
        <div className="min-h-[320px] bg-slate-950/20">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${referenceText} share card`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/70">
              Image will appear here after generation and approval.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
