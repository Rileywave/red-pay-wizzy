import { createFileRoute } from "@tanstack/react-router";
import AdminNotifications from "@/pages/admin/AdminNotifications";

export const Route = createFileRoute("/admin/_panel/notifications")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Notifications" },
      { name: "description", content: "Review the history of notifications sent to RedPay members." },
      { property: "og:title", content: "RedPay Admin — Notifications" },
      { property: "og:description", content: "Review the history of notifications sent to RedPay members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminNotifications,
});
