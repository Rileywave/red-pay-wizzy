import { createFileRoute } from "@tanstack/react-router";
import AdminActivations from "@/pages/admin/AdminActivations";

export const Route = createFileRoute("/admin/_panel/activations")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Activations" },
      { name: "description", content: "Confirm or reject ₦14,900 account activation payments." },
      { property: "og:title", content: "RedPay Admin — Activations" },
      { property: "og:description", content: "Confirm or reject ₦14,900 account activation payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminActivations,
});
