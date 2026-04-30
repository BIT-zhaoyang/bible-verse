import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/publication";

function PublicationsFallback() {
  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
          Loading publications...
        </p>
      </main>
    </div>
  );
}

async function PublicationsContent() {
  await connection();
  await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Publications
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Review by date
            </h1>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        </div>

        <div className="grid gap-4">
          {[overview.today, overview.tomorrow].map((date) => (
            <Link
              key={date}
              href={`/admin/publications/${date}`}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-white"
            >
              Open review for {date}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function AdminPublicationsPage() {
  return (
    <Suspense fallback={<PublicationsFallback />}>
      <PublicationsContent />
    </Suspense>
  );
}
