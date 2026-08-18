import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export const Route = createFileRoute("/admin/_panel/dashboard")({
  head: () => ({
    meta: [
      { title: "RedPay Admin Dashboard" },
      { name: "description", content: "Overview of RedPay members, payments and referral activity." },
      { property: "og:title", content: "RedPay Admin Dashboard" },
      { property: "og:description", content: "Overview of RedPay members, payments and referral activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});
