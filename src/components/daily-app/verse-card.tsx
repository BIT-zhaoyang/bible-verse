import Link from "next/link";
import { Download, Share2, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

import type { VerseCardViewModel } from "./types";

function getPhotoImageUrl(verse: VerseCardViewModel) {
  const imageUrl = verse.sourceImageUrl;

  if (!imageUrl) {
    return null;
  }

  if (/^data:image\/(?:png|jpeg|webp);base64,/.test(imageUrl)) {
    return imageUrl;
  }

  return /\.(?:png|jpe?g|webp)(?:[?#].*)?$/i.test(imageUrl) ? imageUrl : null;
}

function getDownloadImageUrl(verse: VerseCardViewModel) {
  return (
    verse.portraitImageUrl ??
    verse.simpleImageUrl ??
    verse.extendedImageUrl ??
    verse.shareUrl
  );
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
  const imageUrl = getPhotoImageUrl(verse);

  return (
    <section
      className="relative min-h-[548px] overflow-hidden bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_24%),linear-gradient(145deg,#f7dec1_0%,#d49b5f_36%,#587a55_68%,#142026_100%)]"
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.36)), url(${imageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_44%,rgba(0,0,0,0.40)_100%)]" />
      <div className="relative flex min-h-[548px] flex-col px-6 pb-7 pt-7">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[#102033]">
          <Sun className="h-5 w-5 text-[#c78236]" />
          Today&apos;s Verse
        </div>
        <h1
          className={cn(
            "mt-8 max-w-[290px] font-display font-bold leading-[1.08] text-black",
            getVerseTitleClass(verse, "home"),
          )}
        >
          {verse.verseText}
        </h1>
        <p className="mt-5 font-display text-lg text-black">— {verse.referenceText}</p>
        <div className="mt-auto grid max-w-[190px] gap-3">
          <Link
            href={`/verse/${verse.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#0f2742] px-4 text-sm font-semibold text-white shadow-sm"
          >
            Read Explanation
          </Link>
          <a
            href={verse.shareUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#102033]/45 bg-white/15 px-4 text-sm font-semibold text-[#102033] backdrop-blur"
          >
            <Share2 className="h-4 w-4" />
            Share
          </a>
        </div>
      </div>
    </section>
  );
}

type DetailVerseImageProps = {
  verse: VerseCardViewModel;
};

export function DetailVerseImage({ verse }: DetailVerseImageProps) {
  const imageUrl = getPhotoImageUrl(verse);

  return (
    <section className="px-5">
      <div
        className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(145deg,#f3d4ac_0%,#c99158_34%,#8fa18c_60%,#2d424d_100%)]"
        style={
          imageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.24)), url(${imageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_42%,rgba(0,0,0,0.20)_100%)]" />
        <div className="relative flex h-full flex-col items-center justify-center px-7 text-center">
          <h1
            className={cn(
              "font-display font-bold leading-[1.06] text-black",
              getVerseTitleClass(verse, "detail"),
            )}
          >
            {verse.verseText}
          </h1>
          <p className="mt-6 font-display text-xl text-black">— {verse.referenceText}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <a
          href={verse.shareUrl}
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

type VerseThumbProps = {
  verse: VerseCardViewModel;
  compact?: boolean;
};

export function VerseThumb({ verse, compact = false }: VerseThumbProps) {
  const imageUrl = verse.portraitImageUrl;

  return (
    <Link href={`/verse/${verse.slug}`} className="block">
      <div
        className="relative overflow-hidden rounded-md bg-[#d8c3a4]"
        style={{
          aspectRatio: compact ? "3 / 4" : "1 / 1",
          backgroundImage: imageUrl ? `linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.34)), url(${imageUrl})` : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {!imageUrl ? (
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
        ) : null}
      </div>
      <p className="mt-2 text-xs text-[#4b5563]">{verse.publishDate}</p>
    </Link>
  );
}
