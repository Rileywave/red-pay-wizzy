import { createFileRoute } from "@tanstack/react-router";
import Withdraw from "@/pages/Withdraw";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw From RedPay" },
      { name: "description", content: "Request a payout from your RedPay wallet to your bank account." },
      { property: "og:title", content: "Withdraw From RedPay" },
      { property: "og:description", content: "Request a payout from your RedPay wallet to your bank account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Withdraw,
});
