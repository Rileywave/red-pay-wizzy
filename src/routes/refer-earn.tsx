import { createFileRoute } from "@tanstack/react-router";
import ReferEarn from "@/pages/ReferEarn";

export const Route = createFileRoute("/refer-earn")({
  head: () => ({
    meta: [
      { title: "Refer and Earn on RedPay" },
      { name: "description", content: "Share your RedPay referral link and earn a bonus for every confirmed signup." },
      { property: "og:title", content: "Refer and Earn on RedPay" },
      { property: "og:description", content: "Share your RedPay referral link and earn a bonus for every confirmed signup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReferEarn,
});
