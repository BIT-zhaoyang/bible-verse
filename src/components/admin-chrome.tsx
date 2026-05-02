import Link from "next/link";
import { BookOpen, LayoutDashboard, Layers3, LogOut, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { logoutAction } from "@/app/admin/actions";

import { Button } from "./ui/button";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/publications", label: "Publications", icon: Sparkles },
  { href: "/admin/content", label: "Content", icon: Layers3 },
];

type AdminHeaderProps = {
  currentPath: string;
};

export function AdminHeader({ currentPath }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#101a2f]/88 px-4 py-3 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-md md:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-amber-300">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Daily Bible Verse
          </span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {adminLinks.map((link) => {
            const active =
              currentPath === link.href || currentPath.startsWith(`${link.href}/`);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction}>
          <Button variant="secondary" size="icon" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
