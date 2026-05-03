export type DailyNavPath = "/" | "/archive" | "/about" | "/subscribe" | "/profile";

export type VerseCardViewModel = {
  publishDate: string;
  slug: string;
  referenceText: string;
  verseText: string;
  explanationText: string;
  sourceImageUrl: string | null;
  portraitImageUrl: string | null;
  simpleImageUrl: string | null;
  extendedImageUrl: string | null;
  shareUrl: string;
};

export type HomeScreenViewModel = {
  today: string;
  verse: VerseCardViewModel | null;
  recent: VerseCardViewModel[];
};

export type ArchiveScreenViewModel = {
  monthLabel: string;
  publications: VerseCardViewModel[];
};

export type VerseDetailScreenViewModel = {
  verse: VerseCardViewModel;
};
