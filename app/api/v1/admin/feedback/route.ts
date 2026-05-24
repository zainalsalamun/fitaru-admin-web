import { apiError, apiSuccess } from "@/lib/api/response";
import { getAdminFeedback } from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { feedback } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: feedback,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminFeedback(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FEEDBACK_QUERY_FAILED",
      details: error,
      message: "Failed to load admin feedback.",
    });
  }
}
