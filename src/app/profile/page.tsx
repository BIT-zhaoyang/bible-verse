import type { Metadata } from "next";

import { ProfileScreen } from "@/components/daily-app/screens";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage devotional email preferences.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
