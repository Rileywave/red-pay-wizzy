import { createFileRoute } from "@tanstack/react-router";
import Activate from "@/pages/Activate";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Activate Your RedPay Account" },
      { name: "description", content: "Complete RedPay validation and pay the ₦14,900 activation fee to unlock withdrawals." },
      { property: "og:title", content: "Activate Your RedPay Account" },
      { property: "og:description", content: "Complete RedPay validation and pay the ₦14,900 activation fee to unlock withdrawals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Activate,
});
