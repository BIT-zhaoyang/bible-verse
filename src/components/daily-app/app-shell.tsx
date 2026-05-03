import Link from "next/link";
import {
  CalendarDays,
  Home,
  Info,
  Mail,
  Menu,
  UserRound,
} from "lucide-react";

import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

import type { DailyNavPath } from "./types";

const navItems: Array<{
  href: DailyNavPath;
  label: string;
  icon: typeof Home;
}> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/archive", label: "Archive", icon: CalendarDays },
  { href: "/about", label: "About", icon: Info },
  { href: "/subscribe", label: "Subscribe", icon: Mail },
  { href: "/profile", label: "Profile", icon: UserRound },
];

type DailyAppShellProps = {
  currentPath: DailyNavPath;
  children: React.ReactNode;
};

export function DailyAppShell({ currentPath, children }: DailyAppShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f3f1] text-[#101820]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#fffdfb] shadow-[0_18px_70px_rgba(15,23,42,0.08)] sm:my-5 sm:min-h-[calc(100vh-2.5rem)] sm:overflow-hidden sm:rounded-[18px] sm:border sm:border-black/10">
        <div className="flex min-h-screen flex-col sm:min-h-[calc(100vh-2.5rem)]">
          {children}
          <DailyBottomNav currentPath={currentPath} />
        </div>
      </div>
    </div>
  );
}

export function BrandHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-5">
      <Link href="/" className="flex items-center gap-2 font-display text-[18px] font-semibold">
        <BrandMark />
        {appConfig.siteName}
      </Link>
      <Link
        href="/archive"
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#111827]"
      >
        <Menu className="h-6 w-6" />
      </Link>
    </header>
  );
}

type DetailHeaderProps = {
  dateLabel: string;
};

export function DetailHeader({ dateLabel }: DetailHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-5 text-sm">
      <Link href="/" className="inline-flex items-center gap-2 rounded-md py-2 text-[#111827]">
        <span aria-hidden="true" className="text-xl leading-none">
          &lt;
        </span>
        Back
      </Link>
      <div className="inline-flex items-center gap-2 text-[#111827]">
        <CalendarDays className="h-4 w-4" />
        {dateLabel}
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <span aria-hidden="true" className="relative inline-flex h-8 w-6 items-center justify-center">
      <span className="absolute left-1/2 top-1 h-7 w-[2px] -translate-x-1/2 rounded-full bg-black" />
      <span className="absolute left-[7px] top-[9px] h-[2px] w-[14px] rounded-full bg-black" />
      <span className="absolute left-[9px] top-[14px] h-[2px] w-[10px] rounded-full bg-black" />
    </span>
  );
}

function DailyBottomNav({ currentPath }: { currentPath: DailyNavPath }) {
  return (
    <nav className="sticky bottom-0 z-10 mt-auto grid grid-cols-5 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur">
      {navItems.map((item) => {
        const active = currentPath === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] text-[#6b7280]",
              active && "font-semibold text-[#0f2742]",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
