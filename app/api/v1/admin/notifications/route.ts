import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import {
  createAdminNotification,
  createAuditLog,
  deleteAdminNotification,
  getAdminNotifications,
  updateAdminNotification,
} from "@/lib/admin-repository";
import { notifications } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readNullableDate(value: unknown) {
  const dateValue = readString(value);

  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("scheduledAt must be a valid date.");
  }

  return date.toISOString();
}

function readNotificationPayload(payload: Record<string, unknown>) {
  const message = readString(payload.message);
  const scheduledAt = readNullableDate(payload.scheduledAt);
  const status = readString(payload.status, "draft");
  const targetSegment = readString(payload.targetSegment, "all");
  const title = readString(payload.title);

  if (!message || !status || !targetSegment || !title) {
    throw new Error("Notification title, message, segment, and status are required.");
  }

  return {
    message,
    scheduledAt,
    status,
    targetSegment,
    title,
  };
}

function readId(payload: Record<string, unknown>) {
  const id = readString(payload.id);

  if (!id) {
    throw new Error("Notification id is required.");
  }

  return id;
}

export async function GET() {
  const auth = await requireAdminApi("Notifications");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: notifications,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminNotifications(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_NOTIFICATIONS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin notifications.",
    });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi("Notifications");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiError({
      code: "SUPABASE_ADMIN_NOT_CONFIGURED",
      message: "Supabase admin env is required to create notifications.",
      status: 503,
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readNotificationPayload(payload);

    await createAdminNotification(input);
    await createAuditLog({
      action: "create",
      adminUserId: auth.session.id,
      metadata: { status: input.status, targetSegment: input.targetSegment, title: input.title },
      resourceType: "notification",
    });

    return apiSuccess({
      items: await getAdminNotifications(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_NOTIFICATION_CREATE_FAILED",
      details: error,
      message: "Failed to create admin notification.",
    });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Notifications");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiError({
      code: "SUPABASE_ADMIN_NOT_CONFIGURED",
      message: "Supabase admin env is required to update notifications.",
      status: 503,
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);
    const input = readNotificationPayload(payload);

    await updateAdminNotification(id, input);
    await createAuditLog({
      action: "update",
      adminUserId: auth.session.id,
      metadata: { status: input.status, targetSegment: input.targetSegment, title: input.title },
      resourceId: id,
      resourceType: "notification",
    });

    return apiSuccess({
      items: await getAdminNotifications(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_NOTIFICATION_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin notification.",
    });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi("Notifications");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiError({
      code: "SUPABASE_ADMIN_NOT_CONFIGURED",
      message: "Supabase admin env is required to delete notifications.",
      status: 503,
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);

    await deleteAdminNotification(id);
    await createAuditLog({
      action: "delete",
      adminUserId: auth.session.id,
      resourceId: id,
      resourceType: "notification",
    });

    return apiSuccess({
      items: await getAdminNotifications(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_NOTIFICATION_DELETE_FAILED",
      details: error,
      message: "Failed to delete admin notification.",
    });
  }
}
