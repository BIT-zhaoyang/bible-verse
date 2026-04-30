import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">404</p>
        <h1 className="text-4xl font-semibold text-slate-900">
          This verse page could not be found
        </h1>
        <p className="max-w-xl text-base leading-8 text-slate-600">
          The requested publication may not exist yet, or it is not available for
          public viewing.
        </p>
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Return home
        </Link>
      </main>
    </div>
  );
}
