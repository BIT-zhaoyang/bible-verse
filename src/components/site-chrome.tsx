import Link from "next/link";
import { BookOpen, Mail, Menu, UserRound } from "lucide-react";

import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
  { href: "/subscribe", label: "Subscribe" },
];

type SiteHeaderProps = {
  currentPath: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[28px] border border-[rgba(84,60,37,0.12)] bg-[rgba(255,248,241,0.88)] px-4 py-3 shadow-[0_14px_38px_rgba(84,60,37,0.08)] backdrop-blur-md md:rounded-full md:px-6">
        <Link href="/" className="flex items-center gap-3 text-[color:var(--olive-ink)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(156,104,68,0.12)] text-[color:var(--clay)]">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="grid gap-0.5">
            <span className="font-display text-lg font-semibold tracking-tight md:text-xl">
              {appConfig.siteName}
            </span>
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[color:rgba(107,90,73,0.72)] md:text-[0.68rem]">
              Daily encouragement
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {siteLinks.map((link) => {
            const active = currentPath === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors",
                  active
                    ? "bg-[color:var(--olive-ink)] text-white"
                    : "text-[color:var(--muted-ink)] hover:bg-white/80 hover:text-[color:var(--olive-ink)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link href="/archive" aria-label="Open archive">
              <Menu className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/subscribe" aria-label="Subscribe">
              <Mail className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="icon" className="hidden md:inline-flex" asChild>
            <Link href="/admin/login" aria-label="Admin">
              <UserRound className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t soft-divider pt-8">
      <div className="flex flex-col gap-4 text-sm text-[color:var(--muted-ink)] md:flex-row md:items-center md:justify-between">
        <p>
          {appConfig.siteName} shares one verse each day with warmth, clarity, and
          a little encouragement for today.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/">Home</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/about">About</Link>
          <Link href="/subscribe">Subscribe</Link>
        </div>
      </div>
    </footer>
  );
}

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: PageIntroProps) {
  return (
    <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="public-section-label">{eyebrow}</p>
        <h1 className="font-display text-5xl font-semibold leading-none text-[color:var(--olive-ink)] md:text-6xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--muted-ink)]">
          {description}
        </p>
      </div>
      {action}
    </section>
  );
}
