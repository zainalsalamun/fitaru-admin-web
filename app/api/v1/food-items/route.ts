import { apiSuccess } from "@/lib/api/response";
import { foodItems } from "@/lib/cms-data";
import { hasSupabasePublicEnv } from "@/lib/env";

export function GET() {
  const activeFoodItems = foodItems.filter((item) => item.status === "Active");

  return apiSuccess({
    items: activeFoodItems,
    source: hasSupabasePublicEnv() ? "supabase-public-ready" : "mock",
  });
}
