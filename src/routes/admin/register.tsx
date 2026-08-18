import { createFileRoute } from "@tanstack/react-router";
import AdminRegister from "@/pages/admin/AdminRegister";

export const Route = createFileRoute("/admin/register")({
  head: () => ({
    meta: [
      { title: "RedPay Admin Registration" },
      { name: "description", content: "Create a RedPay administrator account." },
      { property: "og:title", content: "RedPay Admin Registration" },
      { property: "og:description", content: "Create a RedPay administrator account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminRegister,
});
