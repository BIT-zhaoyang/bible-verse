import { connection } from "next/server";
import { Suspense } from "react";

import { HomeScreen } from "@/components/daily-app/screens";
import { getHomeScreenData } from "@/lib/public-screen-data";

function HomeFallback() {
  return (
    <div className="min-h-screen bg-[#f4f3f1] px-6 py-10 text-center text-sm uppercase tracking-[0.24em] text-[#6b7280]">
      Loading today&apos;s verse...
    </div>
  );
}

async function HomeContent() {
  await connection();

  const data = await getHomeScreenData();

  return <HomeScreen data={data} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
