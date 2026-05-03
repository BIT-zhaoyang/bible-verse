import type { Metadata } from "next";

import { AboutScreen } from "@/components/daily-app/screens";

export const metadata: Metadata = {
  title: "About",
  description: "Learn the mission behind Daily Bible Verse.",
};

export default function AboutPage() {
  return <AboutScreen />;
}
