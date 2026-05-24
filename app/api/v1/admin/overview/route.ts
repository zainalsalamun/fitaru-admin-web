import { apiSuccess } from "@/lib/api/response";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/env";
import { feedback, stats, topFoods } from "@/lib/dashboard-data";

export function GET() {
  return apiSuccess({
    source: hasSupabaseAdminEnv() ? "supabase" : "mock",
    supabase: {
      adminConfigured: hasSupabaseAdminEnv(),
      publicConfigured: hasSupabasePublicEnv(),
    },
    stats: {
      activeUsersToday: stats[1].value,
      feedbackNew: stats[3].value,
      mealLogsToday: stats[2].value,
      totalUsers: stats[0].value,
    },
    topFoods,
    recentFeedback: feedback,
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
