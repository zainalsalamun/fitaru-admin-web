import { apiError, apiSuccess } from "@/lib/api/response";
import { getAdminUsers } from "@/lib/admin-repository";
import { users } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: users,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminUsers(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_USERS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin users.",
    });
  }
}
