import { createFileRoute } from "@tanstack/react-router";
import Broadcast from "@/pages/Broadcast";

export const Route = createFileRoute("/broadcast")({
  head: () => ({
    meta: [
      { title: "RedPay Broadcast" },
      { name: "description", content: "Read the latest RedPay announcements and broadcast messages." },
      { property: "og:title", content: "RedPay Broadcast" },
      { property: "og:description", content: "Read the latest RedPay announcements and broadcast messages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Broadcast,
});
