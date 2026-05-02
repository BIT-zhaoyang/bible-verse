import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminHeader } from "@/components/admin-chrome";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getContentAdminList } from "@/lib/publication";

function ContentFallback() {
  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
          Loading content library...
        </p>
      </main>
    </div>
  );
}

async function ContentPageContent() {
  await connection();
  await requireAdmin();
  const verses = await getContentAdminList();

  return (
    <div className="admin-shell">
      <main className="admin-main-shell">
        <AdminHeader currentPath="/admin/content" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Content library
            </p>
            <h1 className="mt-2 font-display text-5xl font-semibold text-white">
              Managed verses
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Review all prepared verses, current status, and the most recent publish
              date for each passage.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-slate-300 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        <Card className="overflow-hidden border-white/10 bg-white/[0.06] text-white">
          <CardHeader>
            <h2 className="font-display text-3xl font-semibold text-white">
              Verse inventory
            </h2>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr>
                <th className="px-4 py-4 font-medium">Reference</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Last published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {verses.map((verse) => (
                <tr key={verse.id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{verse.referenceText}</div>
                    <div className="text-xs text-slate-400">{verse.slug}</div>
                  </td>
                  <td className="px-4 py-4">
                    {verse.status} / {verse.isActive ? "active" : "inactive"}
                  </td>
                  <td className="px-4 py-4">{verse.lastPublishedDate ?? "Never"}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <Suspense fallback={<ContentFallback />}>
      <ContentPageContent />
    </Suspense>
  );
}
