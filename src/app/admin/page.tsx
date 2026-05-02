import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, CalendarDays, Layers3, Sparkles } from "lucide-react";

import { generateTomorrowAction, logoutAction } from "./actions";
import { AdminHeader } from "@/components/admin-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/publication";

function DashboardFallback() {
  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
          Loading dashboard...
        </p>
      </main>
    </div>
  );
}

async function DashboardContent() {
  await connection();
  const admin = await requireAdmin();
  const overview = await getAdminOverview();
  const todayPublication = overview.publications.find(
    (publication) => publication.publishDate === overview.today,
  );

  return (
    <div className="admin-shell">
      <main className="admin-main-shell">
        <AdminHeader currentPath="/admin" />

        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Dashboard
            </p>
            <h1 className="font-display text-5xl font-semibold text-white">
              Welcome, {admin.username}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Review today&apos;s published record, prepare tomorrow&apos;s candidate,
              and keep the verse pipeline moving.
            </p>
          </div>
          <form action={logoutAction}>
            <Button variant="secondary">Sign out</Button>
          </form>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.06] text-white">
            <CardHeader className="gap-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Today</p>
              <h2 className="font-display text-3xl font-semibold text-white">
                {overview.today}
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-slate-950/50 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Current status</p>
                <p className="mt-2">
                  {todayPublication
                    ? `${todayPublication.status} publication is ready.`
                    : "No approved publication yet for today."}
                </p>
              </div>
              <Button variant="secondary" asChild>
                <Link href={`/admin/publications/${overview.today}`}>
                  Review today
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.06] text-white">
            <CardHeader className="gap-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Tomorrow
              </p>
              <h2 className="font-display text-3xl font-semibold text-white">
                {overview.tomorrow}
              </h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <form action={generateTomorrowAction}>
                <Button variant="admin" className="w-full">
                  Generate tomorrow&apos;s candidate
                </Button>
              </form>
              <Button variant="secondary" asChild>
                <Link href={`/admin/publications/${overview.tomorrow}`}>
                  Review tomorrow
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.06] text-white">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="rounded-full bg-white/10 p-3 text-amber-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-400">Generations</p>
                <p className="text-2xl font-semibold text-white">
                  {overview.generations.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.06] text-white">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="rounded-full bg-white/10 p-3 text-amber-300">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-400">Review dates</p>
                <p className="text-2xl font-semibold text-white">2</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.06] text-white">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="rounded-full bg-white/10 p-3 text-amber-300">
                <Layers3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-400">Content library</p>
                <Button variant="ghost" className="mt-1 p-0 text-white hover:bg-transparent" asChild>
                  <Link href="/admin/content">Open content</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/10 bg-white/[0.06] text-white">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Recent generations
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white">
                Review queue
              </h2>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/admin/publications">Open publication list</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {overview.generations.map((generation) => (
              <Link
                key={`${generation.targetDate}-${generation.generationVersion}`}
                href={`/admin/publications/${generation.targetDate}`}
                className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5 transition hover:border-amber-300/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">{generation.targetDate}</p>
                    <h3 className="text-lg font-semibold text-white">
                      {generation.referenceText}
                    </h3>
                    <p className="text-sm text-slate-300">
                      Version {generation.generationVersion} · {generation.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                    Open review
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
