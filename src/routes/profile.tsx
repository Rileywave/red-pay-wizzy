import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/pages/Profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your RedPay Profile" },
      { name: "description", content: "Update your RedPay profile details, photo and account settings." },
      { property: "og:title", content: "Your RedPay Profile" },
      { property: "og:description", content: "Update your RedPay profile details, photo and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});
