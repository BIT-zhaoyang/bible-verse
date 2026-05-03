import "server-only";

import { appConfig } from "./config";
import {
  getArchivePublications,
  getPublicationBySlug,
  getTodayPublication,
  type PublicPublication,
} from "./publication";
import { getTodayDateKey } from "./time";

import type {
  ArchiveScreenViewModel,
  HomeScreenViewModel,
  VerseCardViewModel,
  VerseDetailScreenViewModel,
} from "@/components/daily-app/types";

function monthLabelFromDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function toVerseCardViewModel(publication: PublicPublication): VerseCardViewModel {
  const shareUrl = `${appConfig.siteUrl}/verse/${publication.slug}`;

  return {
    publishDate: publication.publishDate,
    slug: publication.slug,
    referenceText: publication.referenceText,
    verseText: publication.verseText,
    explanationText: publication.explanationText,
    sourceImageUrl: publication.sourceImageUrl,
    portraitImageUrl: publication.cardImagePortraitUrl,
    simpleImageUrl: publication.cardImageSimpleUrl,
    extendedImageUrl: publication.cardImageExtendedUrl,
    shareUrl,
  };
}

export async function getHomeScreenData(): Promise<HomeScreenViewModel> {
  const [publication, archive] = await Promise.all([
    getTodayPublication(),
    getArchivePublications(),
  ]);

  return {
    today: getTodayDateKey(),
    verse: publication ? toVerseCardViewModel(publication) : null,
    recent: archive.slice(0, 5).map(toVerseCardViewModel),
  };
}

export async function getArchiveScreenData(): Promise<ArchiveScreenViewModel> {
  const publications = await getArchivePublications();
  const firstDate = publications[0]?.publishDate ?? getTodayDateKey();

  return {
    monthLabel: monthLabelFromDate(firstDate),
    publications: publications.map(toVerseCardViewModel),
  };
}

export async function getVerseDetailScreenData(slug: string): Promise<VerseDetailScreenViewModel | null> {
  const publication = await getPublicationBySlug(slug);

  if (!publication) {
    return null;
  }

  return {
    verse: toVerseCardViewModel(publication),
  };
}
