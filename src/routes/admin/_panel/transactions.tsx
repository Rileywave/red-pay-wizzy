import { createFileRoute } from "@tanstack/react-router";
import AdminTransactions from "@/pages/admin/AdminTransactions";

export const Route = createFileRoute("/admin/_panel/transactions")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Transactions" },
      { name: "description", content: "Audit every transaction recorded across RedPay accounts." },
      { property: "og:title", content: "RedPay Admin — Transactions" },
      { property: "og:description", content: "Audit every transaction recorded across RedPay accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminTransactions,
});
