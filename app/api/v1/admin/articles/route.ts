import { apiSuccess } from "@/lib/api/response";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { articles } from "@/lib/dashboard-data";

export function GET() {
  return apiSuccess({
    items: articles,
    source: hasSupabaseAdminEnv() ? "supabase" : "mock",
  });
}
