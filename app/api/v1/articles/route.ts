import { apiSuccess } from "@/lib/api/response";
import { articles } from "@/lib/dashboard-data";
import { hasSupabasePublicEnv } from "@/lib/env";

export function GET() {
  const publishedArticles = articles.filter((article) => article.status === "Published");

  return apiSuccess({
    items: publishedArticles,
    source: hasSupabasePublicEnv() ? "supabase-public-ready" : "mock",
  });
}
