import { createFileRoute } from "@tanstack/react-router";
import Receipt from "@/pages/Receipt";

export const Route = createFileRoute("/receipt/$id")({
  head: () => ({
    meta: [
      { title: "RedPay Transaction Receipt" },
      { name: "description", content: "View and share the receipt for this RedPay transaction." },
      { property: "og:title", content: "RedPay Transaction Receipt" },
      { property: "og:description", content: "View and share the receipt for this RedPay transaction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Receipt,
});
