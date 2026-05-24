import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(value: string) {
  return titleCase(value);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getCount(table: string, filter?: (query: any) => any) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  if (filter) {
    query = filter(query);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getAdminArticles() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        slug,
        title,
        summary,
        content,
        status,
        updated_at,
        content_categories(id, name, slug),
        admin_users(name)
      `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((article: any) => ({
    author: article.admin_users?.name ?? "-",
    category: article.content_categories?.name ?? "-",
    categoryId: article.content_categories?.id ?? "",
    categorySlug: article.content_categories?.slug ?? "",
    content: article.content,
    id: article.id,
    slug: article.slug,
    status: formatStatus(article.status),
    statusValue: article.status,
    summary: article.summary,
    title: article.title,
    updated: formatDate(article.updated_at),
  }));
}

export async function getContentCategories() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("content_categories")
    .select("id, name, slug")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getFirstAdminUserId() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function createAdminArticle(input: {
  categoryId: string;
  content: string;
  status: string;
  summary: string;
  title: string;
}) {
  const supabase = createSupabaseAdminClient();
  const authorId = await getFirstAdminUserId();
  const status = input.status || "draft";
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  const { error } = await supabase.from("articles").insert({
    author_id: authorId,
    category_id: input.categoryId,
    content: input.content,
    published_at: publishedAt,
    slug: createSlug(input.title),
    status,
    summary: input.summary,
    title: input.title,
  });

  if (error) {
    throw error;
  }
}

export async function updateAdminArticle(
  id: string,
  input: {
    categoryId: string;
    content: string;
    status: string;
    summary: string;
    title: string;
  },
) {
  const supabase = createSupabaseAdminClient();
  const status = input.status || "draft";
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("articles")
    .update({
      category_id: input.categoryId,
      content: input.content,
      published_at: publishedAt,
      slug: createSlug(input.title),
      status,
      summary: input.summary,
      title: input.title,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminArticle(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAdminFoodItems() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("food_items")
    .select("name, category, default_portion, calories_per_portion, status")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    calories:
      item.calories_per_portion === null ? "-" : `${formatNumber(item.calories_per_portion)} kkal`,
    category: titleCase(item.category),
    name: item.name,
    portion: titleCase(item.default_portion),
    status: formatStatus(item.status),
  }));
}

export async function getAdminExerciseItems() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exercise_items")
    .select("name, category, default_intensity, default_duration_minutes, calories_per_30_minutes, status")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    calories:
      item.calories_per_30_minutes === null
        ? "-"
        : `${formatNumber(item.calories_per_30_minutes)} kkal`,
    category: titleCase(item.category),
    duration: `${formatNumber(item.default_duration_minutes)} menit`,
    intensity: titleCase(item.default_intensity),
    name: item.name,
    status: formatStatus(item.status),
  }));
}

export async function getAdminFeedback() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("subject, message, status, created_at, users(email, phone)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    message: item.message,
    status: formatStatus(item.status),
    title: item.subject,
    user: `${item.users?.email ?? item.users?.phone ?? "User"} · ${formatDate(item.created_at)}`,
  }));
}

export async function getAdminUsers() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `
        email,
        phone,
        status,
        updated_at,
        user_profiles(display_name, goal)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).map((user: any) => ({
    contact: user.email ?? user.phone ?? "-",
    goal: user.user_profiles?.goal ? titleCase(user.user_profiles.goal) : "-",
    lastActive: formatDate(user.updated_at),
    name: user.user_profiles?.display_name ?? "User Fitaru",
    status: formatStatus(user.status),
  }));
}

export async function getAdminOverview() {
  const [articles, foodItems, feedback, totalUsers, activeUsersToday, mealLogsToday, feedbackNew] =
    await Promise.all([
      getAdminArticles(),
      getAdminFoodItems(),
      getAdminFeedback(),
      getCount("users"),
      getCount("users", (query) => query.eq("status", "active")),
      getCount("meal_logs", (query) => query.gte("logged_at", new Date().toISOString().slice(0, 10))),
      getCount("feedback", (query) => query.eq("status", "open")),
    ]);

  return {
    articles,
    recentFeedback: feedback,
    stats: {
      activeUsersToday: formatNumber(activeUsersToday),
      feedbackNew: formatNumber(feedbackNew),
      mealLogsToday: formatNumber(mealLogsToday),
      totalUsers: formatNumber(totalUsers),
    },
    topFoods: foodItems.slice(0, 5).map((item) => ({
      logs: "Reference",
      meta: `${item.category} · ${item.calories}`,
      name: item.name,
    })),
    userGrowth: [],
  };
}
