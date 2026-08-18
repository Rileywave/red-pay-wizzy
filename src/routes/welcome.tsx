import { createFileRoute } from "@tanstack/react-router";
import Welcome from "@/pages/Welcome";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to RedPay" },
      { name: "description", content: "Get started with RedPay and set up your wallet in a few taps." },
      { property: "og:title", content: "Welcome to RedPay" },
      { property: "og:description", content: "Get started with RedPay and set up your wallet in a few taps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});
