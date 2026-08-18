import { createFileRoute } from "@tanstack/react-router";
import AdminLogin from "@/pages/admin/AdminLogin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "RedPay Admin Login" },
      { name: "description", content: "Secure sign-in for RedPay administrators." },
      { property: "og:title", content: "RedPay Admin Login" },
      { property: "og:description", content: "Secure sign-in for RedPay administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLogin,
});
