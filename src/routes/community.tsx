import { createFileRoute } from "@tanstack/react-router";
import Community from "@/pages/Community";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "RedPay Community" },
      { name: "description", content: "Join the RedPay community for updates, tips and support." },
      { property: "og:title", content: "RedPay Community" },
      { property: "og:description", content: "Join the RedPay community for updates, tips and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});
