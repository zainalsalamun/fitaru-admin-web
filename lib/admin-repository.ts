import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface CountQuery extends PromiseLike<{ count: number | null; error: unknown }> {
  eq(column: string, value: string): CountQuery;
  gte(column: string, value: string): CountQuery;
}

interface CountTableQuery {
  select(columns: string, options: { count: "exact"; head: true }): CountQuery;
}

interface CountClient {
  from(table: string): CountTableQuery;
}

type Relation<T> = T | T[] | null;

interface AdminArticleRow {
  admin_users: Relation<{ name: string | null }>;
  content: string;
  content_categories: Relation<{ id: string; name: string | null; slug: string | null }>;
  id: string;
  slug: string;
  status: string;
  summary: string;
  title: string;
  updated_at: string | null;
}

interface AdminFeedbackRow {
  admin_note: string | null;
  created_at: string | null;
  id: string;
  message: string;
  status: string;
  subject: string;
  users: Relation<{ email: string | null; phone: string | null }>;
}

interface AdminUserRow {
  daily_targets: Relation<{
    calorie_target: number | null;
    exercise_weekly_target: number | null;
    water_glasses_target: number | null;
  }>;
  email: string | null;
  id: string;
  phone: string | null;
  status: string;
  updated_at: string | null;
  user_profiles: Relation<{
    activity_level: string | null;
    current_weight_kg: number | null;
    diet_style: string | null;
    display_name: string | null;
    goal: string | null;
    target_weight_kg: number | null;
  }>;
}

interface AppSettingsRow {
  app_name: string | null;
  default_calorie_target: number | null;
  default_exercise_weekly_target: number | null;
  default_water_glasses_target: number | null;
  maintenance_enabled: boolean | null;
  maintenance_message: string | null;
  reminder_exercise_enabled: boolean | null;
  reminder_meal_enabled: boolean | null;
  reminder_water_enabled: boolean | null;
  support_email: string | null;
  tagline: string | null;
  updated_at: string | null;
}

interface AuditLogRow {
  action: string;
  admin_users: Relation<{ email: string | null; name: string | null }>;
  created_at: string | null;
  id: string;
  metadata: Record<string, unknown> | null;
  resource_id: string | null;
  resource_type: string;
}

export const defaultAppSettings = {
  appName: "Fitaru",
  defaultCalorieTarget: 1800,
  defaultExerciseWeeklyTarget: 3,
  defaultWaterGlassesTarget: 8,
  maintenanceEnabled: false,
  maintenanceMessage: "",
  reminderExerciseEnabled: true,
  reminderMealEnabled: true,
  reminderWaterEnabled: true,
  supportEmail: "support@fitaru.app",
  tagline: "Diet santai, progres tetap jalan.",
  updatedAt: "-",
};

function firstRelation<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] : relation;
}

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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

async function getCount(table: string, filter?: (query: CountQuery) => CountQuery) {
  const supabase = createSupabaseAdminClient() as unknown as CountClient;
  let query = supabase.from(table).select("*", { count: "exact", head: true }) as CountQuery;

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

  return ((data ?? []) as unknown as AdminArticleRow[]).map((article) => {
    const author = firstRelation(article.admin_users);
    const category = firstRelation(article.content_categories);

    return {
      author: author?.name ?? "-",
      category: category?.name ?? "-",
      categoryId: category?.id ?? "",
      categorySlug: category?.slug ?? "",
      content: article.content,
      id: article.id,
      slug: article.slug,
      status: formatStatus(article.status),
      statusValue: article.status,
      summary: article.summary,
      title: article.title,
      updated: formatDate(article.updated_at),
    };
  });
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

export async function getActiveAdminAccountByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role, status")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function markAdminLastLogin(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("admin_users")
    .update({
      last_login_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
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
    .select("id, name, category, default_portion, calories_per_portion, protein_g, carbs_g, fat_g, notes, status")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    calories:
      item.calories_per_portion === null ? "-" : `${formatNumber(item.calories_per_portion)} kkal`,
    category: titleCase(item.category),
    categoryValue: item.category,
    carbsG: item.carbs_g,
    caloriesValue: item.calories_per_portion,
    fatG: item.fat_g,
    id: item.id,
    name: item.name,
    notes: item.notes ?? "",
    portion: titleCase(item.default_portion),
    portionValue: item.default_portion,
    proteinG: item.protein_g,
    status: formatStatus(item.status),
    statusValue: item.status,
  }));
}

export async function createAdminFoodItem(input: {
  caloriesPerPortion: number | null;
  carbsG: number | null;
  category: string;
  defaultPortion: string;
  fatG: number | null;
  name: string;
  notes: string | null;
  proteinG: number | null;
  status: string;
}) {
  const supabase = createSupabaseAdminClient();
  const createdBy = await getFirstAdminUserId();

  const { error } = await supabase.from("food_items").insert({
    calories_per_portion: input.caloriesPerPortion,
    carbs_g: input.carbsG,
    category: input.category,
    created_by: createdBy,
    default_portion: input.defaultPortion,
    fat_g: input.fatG,
    name: input.name,
    notes: input.notes,
    protein_g: input.proteinG,
    status: input.status,
  });

  if (error) {
    throw error;
  }
}

export async function updateAdminFoodItem(
  id: string,
  input: {
    caloriesPerPortion: number | null;
    carbsG: number | null;
    category: string;
    defaultPortion: string;
    fatG: number | null;
    name: string;
    notes: string | null;
    proteinG: number | null;
    status: string;
  },
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("food_items")
    .update({
      calories_per_portion: input.caloriesPerPortion,
      carbs_g: input.carbsG,
      category: input.category,
      default_portion: input.defaultPortion,
      fat_g: input.fatG,
      name: input.name,
      notes: input.notes,
      protein_g: input.proteinG,
      status: input.status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminFoodItem(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("food_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAdminExerciseItems() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exercise_items")
    .select("id, name, category, default_intensity, default_duration_minutes, calories_per_30_minutes, notes, status")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    calories:
      item.calories_per_30_minutes === null
        ? "-"
        : `${formatNumber(item.calories_per_30_minutes)} kkal`,
    caloriesValue: item.calories_per_30_minutes,
    category: titleCase(item.category),
    categoryValue: item.category,
    duration: `${formatNumber(item.default_duration_minutes)} menit`,
    durationValue: item.default_duration_minutes,
    id: item.id,
    intensity: titleCase(item.default_intensity),
    intensityValue: item.default_intensity,
    name: item.name,
    notes: item.notes ?? "",
    status: formatStatus(item.status),
    statusValue: item.status,
  }));
}

export async function createAdminExerciseItem(input: {
  caloriesPer30Minutes: number | null;
  category: string;
  defaultDurationMinutes: number;
  defaultIntensity: string;
  name: string;
  notes: string | null;
  status: string;
}) {
  const supabase = createSupabaseAdminClient();
  const createdBy = await getFirstAdminUserId();

  const { error } = await supabase.from("exercise_items").insert({
    calories_per_30_minutes: input.caloriesPer30Minutes,
    category: input.category,
    created_by: createdBy,
    default_duration_minutes: input.defaultDurationMinutes,
    default_intensity: input.defaultIntensity,
    name: input.name,
    notes: input.notes,
    status: input.status,
  });

  if (error) {
    throw error;
  }
}

export async function updateAdminExerciseItem(
  id: string,
  input: {
    caloriesPer30Minutes: number | null;
    category: string;
    defaultDurationMinutes: number;
    defaultIntensity: string;
    name: string;
    notes: string | null;
    status: string;
  },
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("exercise_items")
    .update({
      calories_per_30_minutes: input.caloriesPer30Minutes,
      category: input.category,
      default_duration_minutes: input.defaultDurationMinutes,
      default_intensity: input.defaultIntensity,
      name: input.name,
      notes: input.notes,
      status: input.status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminExerciseItem(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("exercise_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAdminFeedback() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, subject, message, status, admin_note, created_at, users(email, phone)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as AdminFeedbackRow[]).map((item) => {
    const user = firstRelation(item.users);

    return {
      adminNote: item.admin_note ?? "",
      id: item.id,
      message: item.message,
      status: formatStatus(item.status),
      statusValue: item.status,
      title: item.subject,
      user: `${user?.email ?? user?.phone ?? "User"} · ${formatDate(item.created_at)}`,
    };
  });
}

export async function updateAdminFeedback(
  id: string,
  input: {
    adminNote: string | null;
    status: string;
  },
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("feedback")
    .update({
      admin_note: input.adminNote,
      status: input.status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAdminNotifications() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, target_segment, scheduled_at, sent_at, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).map((notification) => ({
    id: notification.id,
    message: notification.message,
    schedule: notification.scheduled_at ? formatDate(notification.scheduled_at) : "-",
    scheduledAt: notification.scheduled_at ?? "",
    segment: titleCase(notification.target_segment),
    segmentValue: notification.target_segment,
    sentAt: notification.sent_at ?? "",
    status: formatStatus(notification.status),
    statusValue: notification.status,
    title: notification.title,
  }));
}

export async function createAdminNotification(input: {
  message: string;
  scheduledAt: string | null;
  status: string;
  targetSegment: string;
  title: string;
}) {
  const supabase = createSupabaseAdminClient();
  const createdBy = await getFirstAdminUserId();

  const { error } = await supabase.from("notifications").insert({
    created_by: createdBy,
    message: input.message,
    scheduled_at: input.scheduledAt,
    status: input.status,
    target_segment: input.targetSegment,
    title: input.title,
  });

  if (error) {
    throw error;
  }
}

export async function updateAdminNotification(
  id: string,
  input: {
    message: string;
    scheduledAt: string | null;
    status: string;
    targetSegment: string;
    title: string;
  },
) {
  const supabase = createSupabaseAdminClient();
  const sentAt = input.status === "sent" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("notifications")
    .update({
      message: input.message,
      scheduled_at: input.scheduledAt,
      sent_at: sentAt,
      status: input.status,
      target_segment: input.targetSegment,
      title: input.title,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminNotification(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAdminUsers() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `
        id,
        email,
        phone,
        status,
        updated_at,
        user_profiles(display_name, goal, diet_style, activity_level, current_weight_kg, target_weight_kg),
        daily_targets(water_glasses_target, exercise_weekly_target, calorie_target)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as AdminUserRow[]).map((user) => {
    const profile = firstRelation(user.user_profiles);
    const dailyTarget = firstRelation(user.daily_targets);

    return {
      activityLevel: profile?.activity_level ? titleCase(profile.activity_level) : "-",
      calorieTarget: dailyTarget?.calorie_target ?? null,
      contact: user.email ?? user.phone ?? "-",
      currentWeightKg: profile?.current_weight_kg ?? null,
      dietStyle: profile?.diet_style ? titleCase(profile.diet_style) : "-",
      exerciseWeeklyTarget: dailyTarget?.exercise_weekly_target ?? null,
      goal: profile?.goal ? titleCase(profile.goal) : "-",
      id: user.id,
      lastActive: formatDate(user.updated_at),
      name: profile?.display_name ?? "User Fitaru",
      status: formatStatus(user.status),
      statusValue: user.status,
      targetWeightKg: profile?.target_weight_kg ?? null,
      waterGlassesTarget: dailyTarget?.water_glasses_target ?? null,
    };
  });
}

export async function updateAdminUserStatus(id: string, status: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAdminAccounts() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role, status, last_login_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((admin) => ({
    createdAt: formatDate(admin.created_at),
    email: admin.email,
    id: admin.id,
    lastLogin: formatDate(admin.last_login_at),
    name: admin.name,
    role: formatStatus(admin.role),
    roleValue: admin.role,
    status: formatStatus(admin.status),
    statusValue: admin.status,
  }));
}

export async function createAdminAccount(input: {
  email: string;
  name: string;
  role: string;
  status: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_users").insert({
    email: input.email,
    name: input.name,
    role: input.role,
    status: input.status,
  });

  if (error) {
    throw error;
  }
}

export async function updateAdminAccount(
  id: string,
  input: {
    email: string;
    name: string;
    role: string;
    status: string;
  },
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("admin_users")
    .update({
      email: input.email,
      name: input.name,
      role: input.role,
      status: input.status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminAccount(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getAppSettings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select(
      `
        app_name,
        tagline,
        support_email,
        default_calorie_target,
        default_water_glasses_target,
        default_exercise_weekly_target,
        reminder_meal_enabled,
        reminder_water_enabled,
        reminder_exercise_enabled,
        maintenance_enabled,
        maintenance_message,
        updated_at
      `,
    )
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const settings = data as AppSettingsRow | null;

  if (!settings) {
    return defaultAppSettings;
  }

  return {
    appName: settings.app_name ?? defaultAppSettings.appName,
    defaultCalorieTarget:
      settings.default_calorie_target ?? defaultAppSettings.defaultCalorieTarget,
    defaultExerciseWeeklyTarget:
      settings.default_exercise_weekly_target ?? defaultAppSettings.defaultExerciseWeeklyTarget,
    defaultWaterGlassesTarget:
      settings.default_water_glasses_target ?? defaultAppSettings.defaultWaterGlassesTarget,
    maintenanceEnabled: settings.maintenance_enabled ?? defaultAppSettings.maintenanceEnabled,
    maintenanceMessage: settings.maintenance_message ?? defaultAppSettings.maintenanceMessage,
    reminderExerciseEnabled:
      settings.reminder_exercise_enabled ?? defaultAppSettings.reminderExerciseEnabled,
    reminderMealEnabled: settings.reminder_meal_enabled ?? defaultAppSettings.reminderMealEnabled,
    reminderWaterEnabled: settings.reminder_water_enabled ?? defaultAppSettings.reminderWaterEnabled,
    supportEmail: settings.support_email ?? defaultAppSettings.supportEmail,
    tagline: settings.tagline ?? defaultAppSettings.tagline,
    updatedAt: formatDate(settings.updated_at),
  };
}

export async function updateAppSettings(input: Omit<typeof defaultAppSettings, "updatedAt">) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("app_settings").upsert(
    {
      app_name: input.appName,
      default_calorie_target: input.defaultCalorieTarget,
      default_exercise_weekly_target: input.defaultExerciseWeeklyTarget,
      default_water_glasses_target: input.defaultWaterGlassesTarget,
      id: "main",
      maintenance_enabled: input.maintenanceEnabled,
      maintenance_message: input.maintenanceMessage,
      reminder_exercise_enabled: input.reminderExerciseEnabled,
      reminder_meal_enabled: input.reminderMealEnabled,
      reminder_water_enabled: input.reminderWaterEnabled,
      support_email: input.supportEmail,
      tagline: input.tagline,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

export async function createAuditLog(input: {
  action: "create" | "delete" | "publish" | "suspend" | "update";
  adminUserId: string;
  metadata?: Record<string, unknown>;
  resourceId?: string | null;
  resourceType: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    admin_user_id: input.adminUserId,
    metadata: input.metadata ?? {},
    resource_id: input.resourceId ?? null,
    resource_type: input.resourceType,
  });

  if (error) {
    throw error;
  }
}

export async function getAdminAuditLogs() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
        id,
        action,
        resource_type,
        resource_id,
        metadata,
        created_at,
        admin_users(name, email)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as AuditLogRow[]).map((log) => {
    const admin = firstRelation(log.admin_users);

    return {
      action: formatStatus(log.action),
      actionValue: log.action,
      admin: admin?.name ?? admin?.email ?? "-",
      createdAt: formatDateTime(log.created_at),
      id: log.id,
      metadata: log.metadata ?? {},
      resourceId: log.resource_id ?? "-",
      resourceType: formatStatus(log.resource_type),
      resourceTypeValue: log.resource_type,
    };
  });
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
