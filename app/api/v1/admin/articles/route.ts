import { apiError, apiSuccess } from "@/lib/api/response";
import { getAdminArticles } from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { articles } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: articles,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminArticles(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ARTICLES_QUERY_FAILED",
      details: error,
      message: "Failed to load admin articles.",
    });
  }
}
