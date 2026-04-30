import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { generateTomorrowAction, logoutAction } from "./actions";
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

  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Welcome, {admin.username}
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Sign out
            </button>
          </form>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Today</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{overview.today}</h2>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-300">
              {JSON.stringify(
                overview.publications.find(
                  (publication) => publication.publishDate === overview.today,
                ) ?? null,
                null,
                2,
              )}
            </pre>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Tomorrow
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {overview.tomorrow}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <form action={generateTomorrowAction}>
                <button
                  type="submit"
                  className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Generate tomorrow&apos;s candidate
                </button>
              </form>
              <Link
                href={`/admin/publications/${overview.tomorrow}`}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                Review tomorrow
              </Link>
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Recent generations
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Review queue
              </h2>
            </div>
            <Link
              href="/admin/content"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Content library
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {overview.generations.map((generation) => (
              <Link
                key={`${generation.targetDate}-${generation.generationVersion}`}
                href={`/admin/publications/${generation.targetDate}`}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 transition hover:border-amber-300/40"
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
          </div>
        </section>
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
