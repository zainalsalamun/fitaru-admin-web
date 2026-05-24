import { apiError, apiSuccess } from "@/lib/api/response";
import { getAdminFoodItems } from "@/lib/admin-repository";
import { foodItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: foodItems,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminFoodItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FOOD_ITEMS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin food items.",
    });
  }
}
