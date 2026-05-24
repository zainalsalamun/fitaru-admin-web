import { apiSuccess } from "@/lib/api/response";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { feedback } from "@/lib/dashboard-data";

export function GET() {
  return apiSuccess({
    items: feedback,
    source: hasSupabaseAdminEnv() ? "supabase" : "mock",
  });
}
