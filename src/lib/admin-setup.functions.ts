import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "redpaywebservice@gmail.com";

/**
 * Promotes the single pre-approved RedPay admin email to the `admin` role.
 * The caller's identity comes from their validated bearer token only.
 */
export const claimAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = String((context.claims as any)?.email ?? "").toLowerCase();
    if (email !== ADMIN_EMAIL) {
      return { granted: false as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: context.userId, role: "admin" },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );

    if (error) throw error;
    return { granted: true as const };
  });
