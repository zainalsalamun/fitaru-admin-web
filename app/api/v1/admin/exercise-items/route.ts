import { apiError, apiSuccess } from "@/lib/api/response";
import { getAdminExerciseItems } from "@/lib/admin-repository";
import { exerciseItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: exerciseItems,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminExerciseItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_EXERCISE_ITEMS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin exercise items.",
    });
  }
}
