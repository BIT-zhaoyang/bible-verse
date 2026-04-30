import type { Metadata } from "next";
import Link from "next/link";

import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="admin-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
            <h1 className="text-3xl font-semibold text-white">Sign in</h1>
            <p className="text-sm leading-7 text-slate-300">
              Use the single administrator account to review generated verse cards and
              publish daily content.
            </p>
          </div>

          <form action={loginAction} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Username
              <input
                name="username"
                type="text"
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Password
              <input
                name="password"
                type="password"
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                required
              />
            </label>
            <button
              type="submit"
              className="mt-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Sign in
            </button>
          </form>

          <Link href="/" className="mt-6 inline-flex text-sm text-slate-400">
            Back to site
          </Link>
        </div>
      </main>
    </div>
  );
}
