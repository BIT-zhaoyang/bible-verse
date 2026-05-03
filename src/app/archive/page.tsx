import type { Metadata } from "next";

import { ArchiveScreen } from "@/components/daily-app/screens";
import { getArchiveScreenData } from "@/lib/public-screen-data";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse past daily Bible verses and shareable Scripture cards.",
};

export default async function ArchivePage() {
  const data = await getArchiveScreenData();

  return <ArchiveScreen data={data} />;
}
