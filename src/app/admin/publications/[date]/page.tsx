import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import {
  approveGenerationAction,
  regenerateForDateAction,
  rejectGenerationAction,
} from "../../actions";
import { AdminHeader } from "@/components/admin-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getReviewData } from "@/lib/publication";

type ReviewPageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ status?: string }>;
};

function ReviewFallback() {
  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
          Loading review page...
        </p>
      </main>
    </div>
  );
}

async function ReviewPageContent({
  params,
  searchParams,
}: ReviewPageProps) {
  await connection();
  await requireAdmin();
  const { date } = await params;
  const { status } = await searchParams;
  const { generations, publication } = await getReviewData(date);

  return (
    <div className="admin-shell">
      <main className="admin-main-shell">
        <AdminHeader currentPath="/admin/publications" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Publication review
            </p>
            <h1 className="mt-2 font-display text-5xl font-semibold text-white">
              {date}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link href="/admin/publications">
                <ArrowLeft className="h-4 w-4" />
                All dates
              </Link>
            </Button>
            <form action={regenerateForDateAction}>
              <input type="hidden" name="targetDate" value={date} />
              <Button type="submit" variant="admin">
                Regenerate
              </Button>
            </form>
          </div>
        </div>

        {status ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Action completed: {status}
          </p>
        ) : null}

        {publication ? (
          <Card className="border-white/10 bg-white/[0.06] text-sm text-slate-300">
            <CardHeader>
              <p className="uppercase tracking-[0.24em] text-slate-400">
                Current publication
              </p>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-2xl bg-slate-950/60 p-4">
                {JSON.stringify(publication, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6">
          {generations.map((generation) => (
            <Card
              key={generation.id}
              className="border-white/10 bg-white/[0.06] text-white"
            >
              <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Version {generation.generationVersion}
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    {generation.referenceText}
                  </h2>
                  <p className="text-sm text-slate-300">
                    Status: {generation.status} · Trigger: {generation.triggerType}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={approveGenerationAction}>
                    <input type="hidden" name="targetDate" value={date} />
                    <input type="hidden" name="generationId" value={generation.id} />
                    <input type="hidden" name="slug" value={generation.slug} />
                    <Button type="submit" variant="secondary">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectGenerationAction}>
                    <input type="hidden" name="targetDate" value={date} />
                    <input type="hidden" name="generationId" value={generation.id} />
                    <Button type="submit" variant="ghost" className="border border-rose-300/30 text-rose-100 hover:bg-rose-300/10 hover:text-white">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Simple card</p>
                  {generation.cardImageSimpleUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={generation.cardImageSimpleUrl}
                      alt="Simple card"
                      className="w-full rounded-[1.5rem] border border-white/10"
                    />
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Extended card</p>
                  {generation.cardImageExtendedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={generation.cardImageExtendedUrl}
                      alt="Extended card"
                      className="w-full rounded-[1.5rem] border border-white/10"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Prompt snapshot</p>
                <p className="mt-2 leading-7">{generation.promptSnapshot}</p>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function AdminPublicationReviewPage(props: ReviewPageProps) {
  return (
    <Suspense fallback={<ReviewFallback />}>
      <ReviewPageContent {...props} />
    </Suspense>
  );
}
