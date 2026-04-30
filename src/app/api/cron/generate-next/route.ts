import { NextResponse } from "next/server";

import { appConfig } from "@/lib/config";
import { getTomorrowDateKey } from "@/lib/time";
import {
  ensureTodayPublicationStatus,
  generateCandidateForDate,
} from "@/lib/publication";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${appConfig.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTodayPublicationStatus();
  const targetDate = getTomorrowDateKey();
  const result = await generateCandidateForDate(targetDate, "cron");

  return NextResponse.json({
    ok: true,
    targetDate,
    result,
  });
}
