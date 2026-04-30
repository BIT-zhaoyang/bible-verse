import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  approveGenerationAction,
  regenerateForDateAction,
  rejectGenerationAction,
} from "../../actions";
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
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Publication review
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{date}</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
            <form action={regenerateForDateAction}>
              <input type="hidden" name="targetDate" value={date} />
              <button
                type="submit"
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                Regenerate
              </button>
            </form>
          </div>
        </div>

        {status ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Action completed: {status}
          </p>
        ) : null}

        {publication ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            <p className="uppercase tracking-[0.24em] text-slate-400">
              Current publication
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/60 p-4">
              {JSON.stringify(publication, null, 2)}
            </pre>
          </section>
        ) : null}

        <div className="grid gap-6">
          {generations.map((generation) => (
            <article
              key={generation.id}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
            >
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
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectGenerationAction}>
                    <input type="hidden" name="targetDate" value={date} />
                    <input type="hidden" name="generationId" value={generation.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-300/40 px-5 py-3 text-sm font-semibold text-rose-100"
                    >
                      Reject
                    </button>
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
            </article>
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
