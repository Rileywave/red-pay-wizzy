import { createFileRoute } from "@tanstack/react-router";
import AdminPush from "@/pages/admin/AdminPush";

export const Route = createFileRoute("/admin/_panel/push")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Push" },
      { name: "description", content: "Compose and send push notifications to RedPay members." },
      { property: "og:title", content: "RedPay Admin — Push" },
      { property: "og:description", content: "Compose and send push notifications to RedPay members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPush,
});
