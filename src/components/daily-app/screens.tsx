import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  Search,
  Share2,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import { BrandHeader, DailyAppShell, DetailHeader } from "./app-shell";
import type {
  ArchiveScreenViewModel,
  HomeScreenViewModel,
  VerseDetailScreenViewModel,
} from "./types";
import { DetailVerseImage, HomeVerseHero, VerseThumb } from "./verse-card";

const howItWorks = [
  {
    title: "A Verse Every Day",
    description: "We randomly select a Bible verse for you each day.",
    icon: BookOpen,
  },
  {
    title: "Short Explanation",
    description: "Gain insight with a simple and practical explanation.",
    icon: Lightbulb,
  },
  {
    title: "Share & Encourage",
    description: "Share beautiful verse images and encourage others.",
    icon: Share2,
  },
];

const compactPrinciples = [
  {
    title: "Biblical",
    description: "All verses are from the Holy Bible.",
    icon: BookOpen,
  },
  {
    title: "Encouraging",
    description: "Words that inspire and uplift.",
    icon: Lightbulb,
  },
  {
    title: "Shareable",
    description: "Made to be shared and spread God's love.",
    icon: Share2,
  },
];

export function HomeScreen({ data }: { data: HomeScreenViewModel }) {
  return (
    <DailyAppShell currentPath="/">
      <BrandHeader />
      <main className="flex-1">
        {data.verse ? (
          <HomeVerseHero verse={data.verse} />
        ) : (
          <section className="px-6 py-16">
            <h1 className="font-display text-4xl font-bold">Today&apos;s verse is not published yet.</h1>
          </section>
        )}
        <HowItWorksSection />
        <InboxSection />
        <RecentVersesSection verses={data.recent} />
      </main>
    </DailyAppShell>
  );
}

export function VerseDetailScreen({ data }: { data: VerseDetailScreenViewModel }) {
  const verse = data.verse;

  return (
    <DailyAppShell currentPath="/">
      <DetailHeader dateLabel={verse.publishDate} />
      <main className="flex-1 pb-6">
        <DetailVerseImage verse={verse} />
        <section className="px-6 pt-8">
          <h2 className="font-display text-xl font-bold">Explanation</h2>
          <p className="mt-4 text-[15px] leading-7 text-[#111827]">{verse.explanationText}</p>
        </section>
        <section className="px-6 pt-8">
          <h2 className="font-display text-xl font-bold">Prayer</h2>
          <p className="mt-4 text-[15px] leading-7 text-[#111827]">
            Lord, help me to be still and rest in the truth that You are God. Thank You
            for Your peace that calms my heart and mind. Amen.
          </p>
        </section>
      </main>
    </DailyAppShell>
  );
}

export function ArchiveScreen({ data }: { data: ArchiveScreenViewModel }) {
  return (
    <DailyAppShell currentPath="/archive">
      <BrandHeader />
      <main className="flex-1 px-5 pb-8 pt-6">
        <header className="text-center">
          <h1 className="font-display text-[30px] font-bold">Verse Archive</h1>
          <p className="mt-2 text-sm text-[#4b5563]">Browse or search past verses.</p>
        </header>
        <div className="mt-8 grid grid-cols-[1fr_auto] gap-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]" />
            <Input className="h-14 rounded-md border-black/10 pl-10" placeholder="Search by keyword or reference..." disabled />
          </label>
          <button className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[#f3f4f6] px-4 text-sm font-semibold text-[#111827]">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
        <h2 className="mt-8 font-display text-xl font-bold">{data.monthLabel}</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
          {data.publications.map((publication) => (
            <VerseThumb key={`${publication.publishDate}-${publication.slug}`} verse={publication} />
          ))}
        </div>
        <div className="mt-9 text-center">
          <button className="h-12 rounded-md border border-black/20 bg-white px-10 text-sm font-semibold">
            Load More
          </button>
        </div>
      </main>
    </DailyAppShell>
  );
}

export function AboutScreen() {
  return (
    <DailyAppShell currentPath="/about">
      <BrandHeader />
      <main className="flex-1 px-5 pb-8 pt-5">
        <h1 className="font-display text-[28px] font-bold">About Us</h1>
        <div className="mt-1 h-0.5 w-9 bg-[#c47d35]" />
        <div className="mt-5 aspect-[16/9] overflow-hidden rounded-md bg-[linear-gradient(135deg,#ece2d4,#9fb08f_55%,#3d4c39)]" />
        <section className="mt-7">
          <h2 className="font-display text-xl font-bold">Our Mission</h2>
          <p className="mt-4 text-[15px] leading-7 text-[#111827]">
            Our mission is to encourage and uplift believers around the world by
            sharing God&apos;s Word daily.
          </p>
          <p className="mt-4 text-[15px] leading-7 text-[#111827]">
            We believe that Scripture has the power to transform lives, strengthen
            faith, and bring hope to every day.
          </p>
        </section>
        <HowItWorksSection compact />
      </main>
    </DailyAppShell>
  );
}

export function SubscribeScreen() {
  return (
    <DailyAppShell currentPath="/subscribe">
      <BrandHeader />
      <main className="flex-1 px-5 pb-8 pt-5">
        <div className="aspect-[16/9] overflow-hidden rounded-md bg-[linear-gradient(135deg,#8b6f53,#f4efe7_48%,#4b382c)]" />
        <section className="mt-7">
          <h1 className="font-display text-[30px] font-bold">Subscribe</h1>
          <p className="mt-2 text-[17px] leading-7 text-[#111827]">
            Get the Verse of the Day delivered directly to your inbox every morning.
          </p>
          <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
            <Input className="h-12 rounded-md border-black/10" placeholder="Enter your email" />
            <button className="h-12 rounded-md bg-[#0f2742] px-5 text-sm font-semibold text-white">
              Subscribe
            </button>
          </div>
        </section>
        <div className="mt-8 space-y-5">
          {[
            "Daily verse with explanation",
            "Beautiful verse images",
            "Encouraging and uplifting content",
            "Unsubscribe anytime",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-[15px]">
              <CheckCircle2 className="h-5 w-5 text-[#0f2742]" />
              {item}
            </div>
          ))}
        </div>
      </main>
    </DailyAppShell>
  );
}

export function ProfileScreen() {
  const settings = [
    { label: "Profile", icon: UserRound },
    { label: "Email Preferences", icon: Mail },
    { label: "Notification", icon: Bell },
    { label: "Privacy", icon: Lock },
    { label: "Language", icon: Globe2 },
    { label: "Sign Out", icon: LogOut },
  ];

  const prefs = [
    { title: "Verse of the Day", description: "Receive daily verse and explanation", enabled: true },
    { title: "Weekly Encouragement", description: "Receive a weekly email with encouragement", enabled: true },
    { title: "Updates & News", description: "Receive updates about new features", enabled: false },
  ];

  return (
    <DailyAppShell currentPath="/profile">
      <BrandHeader />
      <main className="flex-1 px-5 pb-8 pt-5">
        <h1 className="font-display text-[28px] font-bold">Settings</h1>
        <div className="mt-5 overflow-hidden rounded-md border border-black/10 bg-white">
          {settings.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between border-b border-black/5 px-4 py-4 last:border-b-0">
                <div className="flex items-center gap-3 text-sm">
                  <Icon className="h-5 w-5 text-[#4b5563]" />
                  {item.label}
                </div>
                <ChevronRight className="h-5 w-5 text-[#6b7280]" />
              </div>
            );
          })}
        </div>
        <section className="mt-9">
          <h2 className="font-display text-[24px] font-bold">Email Preferences</h2>
          <p className="mt-1 text-sm text-[#4b5563]">Choose what you want to receive.</p>
          <div className="mt-5 overflow-hidden rounded-md border border-black/10 bg-white">
            {prefs.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 border-b border-black/5 px-4 py-4 last:border-b-0">
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">{item.description}</p>
                </div>
                <span className={`flex h-7 w-12 rounded-full p-1 ${item.enabled ? "justify-end bg-[#0f2742]" : "justify-start bg-[#d1d5db]"}`}>
                  <span className="h-5 w-5 rounded-full bg-white" />
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </DailyAppShell>
  );
}

function HowItWorksSection({ compact = false }: { compact?: boolean }) {
  const items = compact ? compactPrinciples : howItWorks;

  return (
    <section className={compact ? "mt-8 rounded-md border border-black/10 bg-white p-4" : "bg-[#fffdfb] px-5 py-8 text-center"}>
      {!compact ? <h2 className="font-display text-lg font-bold">How It Works</h2> : null}
      <div className={compact ? "grid grid-cols-3 divide-x divide-black/10" : "mt-7 grid grid-cols-3 gap-4"}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={compact ? "px-2 text-center" : "text-center"}>
              <Icon className="mx-auto h-9 w-9 text-[#b67536]" />
              <h3 className="mt-3 font-display text-sm font-bold leading-tight">{item.title}</h3>
              <p className="mt-2 text-[11px] leading-5 text-[#4b5563]">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InboxSection() {
  return (
    <section className="bg-[#f5ede2] px-5 py-7 text-center">
      <h2 className="font-display text-xl font-bold">Get Verse of the Day in Your Inbox</h2>
      <p className="mt-2 text-sm text-[#4b5563]">Start your day with God&apos;s Word. Subscribe now!</p>
      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
        <Input className="h-12 rounded-md border-black/10 bg-white" placeholder="Enter your email" />
        <button className="h-12 rounded-md bg-[#0f2742] px-5 text-sm font-semibold text-white">
          Subscribe
        </button>
      </div>
    </section>
  );
}

function RecentVersesSection({ verses }: { verses: HomeScreenViewModel["recent"] }) {
  return (
    <section className="px-5 py-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Recent Verses</h2>
        <a href="/archive" className="text-sm text-[#0f2742]">
          View all
        </a>
      </div>
      <div className="mt-5 grid grid-flow-col auto-cols-[34%] gap-3 overflow-x-auto pb-2">
        {verses.map((verse) => (
          <VerseThumb key={`${verse.publishDate}-${verse.slug}`} verse={verse} compact />
        ))}
      </div>
    </section>
  );
}
