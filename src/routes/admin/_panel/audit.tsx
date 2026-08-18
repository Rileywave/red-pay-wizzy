import { createFileRoute } from "@tanstack/react-router";
import AdminAudit from "@/pages/admin/AdminAudit";

export const Route = createFileRoute("/admin/_panel/audit")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Audit Log" },
      { name: "description", content: "Track every administrative action taken in RedPay." },
      { property: "og:title", content: "RedPay Admin — Audit Log" },
      { property: "og:description", content: "Track every administrative action taken in RedPay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAudit,
});
