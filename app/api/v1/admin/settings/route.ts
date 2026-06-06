import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import {
  createAuditLog,
  defaultAppSettings,
  getAppSettings,
  updateAppSettings,
} from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readSettingsPayload(payload: Record<string, unknown>) {
  return {
    appName: readString(payload.appName, defaultAppSettings.appName),
    defaultCalorieTarget: readNumber(
      payload.defaultCalorieTarget,
      defaultAppSettings.defaultCalorieTarget,
    ),
    defaultExerciseWeeklyTarget: readNumber(
      payload.defaultExerciseWeeklyTarget,
      defaultAppSettings.defaultExerciseWeeklyTarget,
    ),
    defaultWaterGlassesTarget: readNumber(
      payload.defaultWaterGlassesTarget,
      defaultAppSettings.defaultWaterGlassesTarget,
    ),
    maintenanceEnabled: readBoolean(
      payload.maintenanceEnabled,
      defaultAppSettings.maintenanceEnabled,
    ),
    maintenanceMessage:
      typeof payload.maintenanceMessage === "string"
        ? payload.maintenanceMessage.trim()
        : defaultAppSettings.maintenanceMessage,
    reminderExerciseEnabled: readBoolean(
      payload.reminderExerciseEnabled,
      defaultAppSettings.reminderExerciseEnabled,
    ),
    reminderMealEnabled: readBoolean(
      payload.reminderMealEnabled,
      defaultAppSettings.reminderMealEnabled,
    ),
    reminderWaterEnabled: readBoolean(
      payload.reminderWaterEnabled,
      defaultAppSettings.reminderWaterEnabled,
    ),
    supportEmail: readString(payload.supportEmail, defaultAppSettings.supportEmail).toLowerCase(),
    tagline: readString(payload.tagline, defaultAppSettings.tagline),
  };
}

export async function GET() {
  const auth = await requireAdminApi("Settings");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      settings: defaultAppSettings,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      settings: await getAppSettings(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_SETTINGS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin settings.",
    });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi("Settings");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiError({
      code: "SUPABASE_ADMIN_NOT_CONFIGURED",
      message: "Supabase admin env is required to update settings.",
      status: 503,
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const settings = readSettingsPayload(payload);

    await updateAppSettings(settings);
    await createAuditLog({
      action: "update",
      adminUserId: auth.session.id,
      metadata: {
        appName: settings.appName,
        maintenanceEnabled: settings.maintenanceEnabled,
      },
      resourceId: "main",
      resourceType: "settings",
    });

    return apiSuccess({
      settings: await getAppSettings(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_SETTINGS_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin settings.",
    });
  }
}
