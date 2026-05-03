import type { Metadata } from "next";

import { SubscribeScreen } from "@/components/daily-app/screens";

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Get the verse of the day delivered to your inbox.",
};

export default function SubscribePage() {
  return <SubscribeScreen />;
}
