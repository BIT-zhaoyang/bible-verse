"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { getTomorrowDateKey } from "@/lib/time";
import {
  approveGeneration,
  generateCandidateForDate,
  getAdminUserByUsername,
  rejectGeneration,
} from "@/lib/publication";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await getAdminUserByUsername(username);

  if (!user || !user.isActive) {
    redirect("/admin/login?error=invalid");
  }

  const matches = await verifyPassword(password, user.passwordHash);

  if (!matches) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function approveGenerationAction(formData: FormData) {
  const admin = await requireAdmin();
  const targetDate = String(formData.get("targetDate"));
  const generationId = String(formData.get("generationId"));
  const slug = String(formData.get("slug"));

  await approveGeneration(targetDate, generationId, admin.userId);
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/verse/${slug}`);
  revalidatePath(`/admin/publications/${targetDate}`);
  revalidatePath("/admin");
  redirect(`/admin/publications/${targetDate}?status=approved`);
}

export async function rejectGenerationAction(formData: FormData) {
  await requireAdmin();
  const generationId = String(formData.get("generationId"));
  const targetDate = String(formData.get("targetDate"));

  await rejectGeneration(generationId, "Rejected by admin");
  revalidatePath(`/admin/publications/${targetDate}`);
  revalidatePath("/admin");
  redirect(`/admin/publications/${targetDate}?status=rejected`);
}

export async function regenerateForDateAction(formData: FormData) {
  await requireAdmin();
  const targetDate = String(formData.get("targetDate"));

  await generateCandidateForDate(targetDate, "manual_regenerate");
  revalidatePath(`/admin/publications/${targetDate}`);
  revalidatePath("/admin");
  redirect(`/admin/publications/${targetDate}?status=regenerated`);
}

export async function generateTomorrowAction() {
  await requireAdmin();
  const targetDate = getTomorrowDateKey();

  await generateCandidateForDate(targetDate, "cron");
  revalidatePath("/admin");
  revalidatePath(`/admin/publications/${targetDate}`);
  redirect(`/admin/publications/${targetDate}?status=generated`);
}
