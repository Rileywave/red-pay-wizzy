import { createFileRoute } from "@tanstack/react-router";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";

export const Route = createFileRoute("/admin/_panel/withdrawals")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Withdrawals" },
      { name: "description", content: "Review, approve and mark manual withdrawal payouts as paid." },
      { property: "og:title", content: "RedPay Admin — Withdrawals" },
      { property: "og:description", content: "Review, approve and mark manual withdrawal payouts as paid." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminWithdrawals,
});
