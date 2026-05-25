import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import { getAdminOverview } from "@/lib/admin-repository";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/env";
import { feedback, stats, topFoods } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi("Overview");

  if (auth.error) {
    return auth.error;
  }

  const supabase = {
    adminConfigured: hasSupabaseAdminEnv(),
    publicConfigured: hasSupabasePublicEnv(),
  };

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      recentFeedback: feedback,
      source: "mock",
      stats: {
        activeUsersToday: stats[1].value,
        feedbackNew: stats[3].value,
        mealLogsToday: stats[2].value,
        totalUsers: stats[0].value,
      },
      supabase,
      topFoods,
      userGrowth: [
        { date: "2026-05-17", users: 11800 },
        { date: "2026-05-18", users: 11960 },
        { date: "2026-05-19", users: 12040 },
        { date: "2026-05-20", users: 12110 },
        { date: "2026-05-21", users: 12230 },
        { date: "2026-05-22", users: 12320 },
        { date: "2026-05-23", users: 12480 },
      ],
    });
  }

  try {
    return apiSuccess({
      ...(await getAdminOverview()),
      source: "supabase",
      supabase,
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_OVERVIEW_QUERY_FAILED",
      details: error,
      message: "Failed to load admin overview.",
    });
  }
}
