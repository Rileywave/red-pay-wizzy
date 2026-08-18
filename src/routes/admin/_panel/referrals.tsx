import { createFileRoute } from "@tanstack/react-router";
import AdminReferrals from "@/pages/admin/AdminReferrals";

export const Route = createFileRoute("/admin/_panel/referrals")({
  head: () => ({
    meta: [
      { title: "RedPay Admin — Referrals" },
      { name: "description", content: "Review and confirm referral bonuses for RedPay members." },
      { property: "og:title", content: "RedPay Admin — Referrals" },
      { property: "og:description", content: "Review and confirm referral bonuses for RedPay members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminReferrals,
});
