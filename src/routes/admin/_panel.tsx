import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/_panel")({
  component: AdminLayout,
});
