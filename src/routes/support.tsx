import { createFileRoute } from "@tanstack/react-router";
import Support from "@/pages/Support";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "RedPay Support" },
      { name: "description", content: "Get help from the RedPay support team via chat or Telegram." },
      { property: "og:title", content: "RedPay Support" },
      { property: "og:description", content: "Get help from the RedPay support team via chat or Telegram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Support,
});
