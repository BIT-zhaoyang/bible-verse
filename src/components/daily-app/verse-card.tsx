import Image from "next/image";
import Link from "next/link";
import { Download, Share2, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

import type { VerseCardViewModel } from "./types";

function isBitmapImageUrl(imageUrl: string) {
  return (
    /^data:image\/(?:png|jpeg|webp|svg\+xml);base64,/.test(imageUrl) ||
    /\.(?:png|jpe?g|webp|svg)(?:[?#].*)?$/i.test(imageUrl)
  );
}

function getArtworkImageUrl(verse: VerseCardViewModel) {
  const imageUrl =
    verse.sourceImageUrl ??
    verse.portraitImageUrl ??
    verse.simpleImageUrl ??
    verse.extendedImageUrl;

  if (!imageUrl) {
    return null;
  }

  return isBitmapImageUrl(imageUrl) ? imageUrl : null;
}

function getDownloadImageUrl(verse: VerseCardViewModel) {
  return (
    getArtworkImageUrl(verse) ??
    verse.portraitImageUrl ??
    verse.simpleImageUrl ??
    verse.extendedImageUrl ??
    verse.shareUrl
  );
}

function getShareImageUrl(verse: VerseCardViewModel) {
  return getDownloadImageUrl(verse);
}

function getVerseTitleClass(verse: VerseCardViewModel, mode: "home" | "detail") {
  const length = verse.verseText.length;

  if (mode === "detail") {
    return length > 95
      ? "text-[30px]"
      : length > 64
        ? "text-[34px]"
        : "text-[40px]";
  }

  return length > 95
    ? "text-[29px]"
    : length > 64
      ? "text-[33px]"
      : "text-[38px]";
}

function getThumbTextClass(verse: VerseCardViewModel) {
  const length = verse.verseText.length;

  return length > 95 ? "text-[13px]" : length > 64 ? "text-[15px]" : "text-[19px]";
}

type HomeVerseHeroProps = {
  verse: VerseCardViewModel;
};

export function HomeVerseHero({ verse }: HomeVerseHeroProps) {
  return (
    <section className="px-5 pb-8">
      <div className="pb-5 pt-3">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[#92400e]">
          <Sun className="h-5 w-5 text-[#c47d35]" />
          Today&apos;s Verse
        </div>
        <h1
          className={cn(
            "mt-5 max-w-[360px] font-display font-bold leading-[1.08] text-[#111827]",
            getVerseTitleClass(verse, "home"),
          )}
        >
          {verse.verseText}
        </h1>
        <p className="mt-5 font-display text-lg text-[#111827]">
          — {verse.referenceText}
        </p>
        <p className="mt-4 max-w-[360px] text-[15px] leading-7 text-[#4b5563]">
          {verse.explanationText}
        </p>
      </div>
      <VerseArtworkFrame verse={verse} />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={`/verse/${verse.slug}`}
          className="inline-flex h-12 items-center justify-center rounded-md bg-[#0f2742] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,39,66,0.24)]"
        >
          Read Explanation
        </Link>
        <a
          href={getShareImageUrl(verse)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-4 text-sm font-semibold text-[#0f2742]"
        >
          <Share2 className="h-4 w-4" />
          Share Image
        </a>
      </div>
    </section>
  );
}

type DetailVerseImageProps = {
  verse: VerseCardViewModel;
};

export function DetailVerseImage({ verse }: DetailVerseImageProps) {
  return (
    <section className="px-5">
      <div className="pb-5 pt-1">
        <h1
          className={cn(
            "max-w-[360px] font-display font-bold leading-[1.08] text-[#111827]",
            getVerseTitleClass(verse, "detail"),
          )}
        >
          {verse.verseText}
        </h1>
        <p className="mt-5 font-display text-lg text-[#111827]">
          — {verse.referenceText}
        </p>
      </div>
      <VerseArtworkFrame verse={verse} />
      <div className="mt-5 grid grid-cols-2 gap-4">
        <a
          href={getShareImageUrl(verse)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0f2742] px-4 text-sm font-semibold text-white"
        >
          <Share2 className="h-4 w-4" />
          Share Image
        </a>
        <a
          href={getDownloadImageUrl(verse)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-4 text-sm font-semibold text-[#111827]"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </section>
  );
}

type VerseArtworkFrameProps = {
  verse: VerseCardViewModel;
};

function VerseArtworkFrame({ verse }: VerseArtworkFrameProps) {
  const imageUrl = getArtworkImageUrl(verse);

  return (
    <div
      data-verse-artwork="true"
      className="relative aspect-[9/16] overflow-hidden rounded-md bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.35),transparent_32%),linear-gradient(145deg,#f7dec1_0%,#d49b5f_36%,#587a55_68%,#142026_100%)]"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${verse.referenceText} devotional artwork`}
          fill
          unoptimized
          priority
          sizes="(max-width: 640px) 100vw, 390px"
          className="object-cover"
        />
      ) : null}
    </div>
  );
}

type VerseThumbProps = {
  verse: VerseCardViewModel;
  compact?: boolean;
};

export function VerseThumb({ verse, compact = false }: VerseThumbProps) {
  const imageUrl = getArtworkImageUrl(verse);

  return (
    <Link href={`/verse/${verse.slug}`} className="block">
      <div
        className="relative overflow-hidden rounded-md bg-[#d8c3a4]"
        style={{
          aspectRatio: compact ? "3 / 4" : "1 / 1",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${verse.referenceText} devotional artwork`}
            fill
            unoptimized
            sizes={compact ? "96px" : "(max-width: 640px) 45vw, 180px"}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <p
              className={cn(
                "max-h-[122px] overflow-hidden font-display font-semibold leading-tight text-black",
                getThumbTextClass(verse),
              )}
            >
              {verse.verseText}
            </p>
            <p className="font-display text-sm font-semibold text-black">
              {verse.referenceText}
            </p>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-[#4b5563]">{verse.publishDate}</p>
    </Link>
  );
}
