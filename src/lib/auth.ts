import "server-only";

import { createHash, randomBytes } from "crypto";

import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";

import { appConfig } from "./config";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256(`${rawToken}:${appConfig.sessionSecret}`);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  await db.insert(adminSessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(appConfig.adminCookieName, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(appConfig.adminCookieName)?.value;

  if (sessionToken) {
    const tokenHash = sha256(`${sessionToken}:${appConfig.sessionSecret}`);
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
  }

  cookieStore.delete(appConfig.adminCookieName);
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(appConfig.adminCookieName)?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = sha256(`${sessionToken}:${appConfig.sessionSecret}`);

  const [session] = await db
    .select({
      userId: adminSessions.userId,
      username: adminUsers.username,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.userId))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        gt(adminSessions.expiresAt, new Date()),
        eq(adminUsers.isActive, true),
      ),
    )
    .limit(1);

  return session ?? null;
}

export async function requireAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
