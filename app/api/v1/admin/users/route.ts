import { apiSuccess } from "@/lib/api/response";
import { users } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export function GET() {
  return apiSuccess({
    items: users,
    source: hasSupabaseAdminEnv() ? "supabase" : "mock",
  });
}
