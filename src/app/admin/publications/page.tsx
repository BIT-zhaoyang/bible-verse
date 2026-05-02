import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminHeader } from "@/components/admin-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <main className="admin-main-shell">
        <AdminHeader currentPath="/admin/publications" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Publications
            </p>
            <h1 className="mt-2 font-display text-5xl font-semibold text-white">
              Review by date
            </h1>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/admin">Dashboard</Link>
          </Button>
        </div>

        <Card className="border-white/10 bg-white/[0.06] text-white">
          <CardHeader>
            <h2 className="font-display text-3xl font-semibold text-white">
              Available review dates
            </h2>
          </CardHeader>
          <CardContent className="grid gap-4">
          {[overview.today, overview.tomorrow].map((date) => (
            <Link
              key={date}
              href={`/admin/publications/${date}`}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-6 text-white transition hover:border-amber-300/40"
            >
              Open review for {date}
            </Link>
          ))}
          </CardContent>
        </Card>
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
