import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/pages/Auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedPay — Sign In" },
      { name: "description", content: "Sign in or create your RedPay account to manage your wallet, referrals and payouts." },
      { property: "og:title", content: "RedPay — Sign In" },
      { property: "og:description", content: "Sign in or create your RedPay account to manage your wallet, referrals and payouts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auth,
});
