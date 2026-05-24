import { apiSuccess } from "@/lib/api/response";
import { exerciseItems } from "@/lib/cms-data";
import { hasSupabasePublicEnv } from "@/lib/env";

export function GET() {
  const activeExerciseItems = exerciseItems.filter((item) => item.status === "Active");

  return apiSuccess({
    items: activeExerciseItems,
    source: hasSupabasePublicEnv() ? "supabase-public-ready" : "mock",
  });
}
