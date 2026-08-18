import { createFileRoute } from "@tanstack/react-router";
import History from "@/pages/History";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "RedPay Transaction History" },
      { name: "description", content: "Browse every credit, debit and referral bonus on your RedPay account." },
      { property: "og:title", content: "RedPay Transaction History" },
      { property: "og:description", content: "Browse every credit, debit and referral bonus on your RedPay account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: History,
});
