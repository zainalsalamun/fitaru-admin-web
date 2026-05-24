import { apiSuccess } from "@/lib/api/response";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/env";

export function GET() {
  return apiSuccess({
    app: "fitaru-admin",
    status: "ok",
    supabase: {
      adminConfigured: hasSupabaseAdminEnv(),
      publicConfigured: hasSupabasePublicEnv(),
    },
    timestamp: new Date().toISOString(),
  });
}
