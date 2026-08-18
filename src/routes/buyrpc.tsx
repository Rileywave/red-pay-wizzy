import { createFileRoute } from "@tanstack/react-router";
import BuyRPC from "@/pages/BuyRPC";

export const Route = createFileRoute("/buyrpc")({
  head: () => ({
    meta: [
      { title: "Buy Your RedPay Activation Code" },
      { name: "description", content: "Purchase your RPC activation code to unlock RedPay withdrawals." },
      { property: "og:title", content: "Buy Your RedPay Activation Code" },
      { property: "og:description", content: "Purchase your RPC activation code to unlock RedPay withdrawals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuyRPC,
});
