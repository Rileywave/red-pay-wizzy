import { createFileRoute } from "@tanstack/react-router";
import PaymentInstructions from "@/pages/PaymentInstructions";

export const Route = createFileRoute("/payment-instructions")({
  head: () => ({
    meta: [
      { title: "RedPay Payment Instructions" },
      { name: "description", content: "Follow the payment steps and upload your proof to activate your account." },
      { property: "og:title", content: "RedPay Payment Instructions" },
      { property: "og:description", content: "Follow the payment steps and upload your proof to activate your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentInstructions,
});
