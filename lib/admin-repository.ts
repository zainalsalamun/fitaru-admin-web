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
        title,
        status,
        updated_at,
        content_categories(name),
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
    status: formatStatus(article.status),
    title: article.title,
    updated: formatDate(article.updated_at),
  }));
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
