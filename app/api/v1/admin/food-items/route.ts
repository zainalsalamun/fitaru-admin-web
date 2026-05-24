import { apiSuccess } from "@/lib/api/response";
import { foodItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export function GET() {
  return apiSuccess({
    items: foodItems,
    source: hasSupabaseAdminEnv() ? "supabase" : "mock",
  });
}
