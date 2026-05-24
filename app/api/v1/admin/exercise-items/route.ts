import { apiSuccess } from "@/lib/api/response";
import { exerciseItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export function GET() {
  return apiSuccess({
    items: exerciseItems,
    source: hasSupabaseAdminEnv() ? "supabase" : "mock",
  });
}
