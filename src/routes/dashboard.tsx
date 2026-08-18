import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "RedPay Wallet Dashboard" },
      { name: "description", content: "View your RedPay balance, daily claims and recent activity." },
      { property: "og:title", content: "RedPay Wallet Dashboard" },
      { property: "og:description", content: "View your RedPay balance, daily claims and recent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
