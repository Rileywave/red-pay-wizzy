import { createFileRoute } from "@tanstack/react-router";
import AdminPayments from "@/pages/admin/AdminPayments";

export const Route = createFileRoute("/admin/_panel/payments")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Payments" },
      { name: "description", content: "Approve or reject activation code payments and issue RPC codes." },
      { property: "og:title", content: "RedPay Admin — Payments" },
      { property: "og:description", content: "Approve or reject activation code payments and issue RPC codes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPayments,
});
