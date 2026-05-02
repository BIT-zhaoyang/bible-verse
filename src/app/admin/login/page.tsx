import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="admin-shell">
      <main className="admin-main-shell items-center justify-center">
        <Card className="w-full max-w-md border-white/10 bg-white/[0.06] text-white shadow-[0_28px_70px_rgba(2,6,23,0.45)]">
          <CardContent className="space-y-8 p-8">
            <div className="space-y-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-amber-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Admin
                </p>
                <h1 className="font-display text-4xl font-semibold text-white">
                  Sign in
                </h1>
                <p className="text-sm leading-7 text-slate-300">
                  Use the administrator account to review generated verse cards and
                  publish daily content.
                </p>
              </div>
            </div>

            <form action={loginAction} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Username
                <Input
                  name="username"
                  type="text"
                  className="border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Password
                <Input
                  name="password"
                  type="password"
                  className="border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                  required
                />
              </label>
              <Button variant="admin" size="lg" type="submit" className="mt-2">
                Sign in
              </Button>
            </form>

            <Button variant="ghost" className="p-0 text-slate-400 hover:bg-transparent" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to site
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
