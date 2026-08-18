import { createFileRoute } from "@tanstack/react-router";
import SuccessPage from "@/pages/SuccessPage";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "RedPay Payment Successful" },
      { name: "description", content: "Your RedPay request went through successfully." },
      { property: "og:title", content: "RedPay Payment Successful" },
      { property: "og:description", content: "Your RedPay request went through successfully." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessPage,
});
