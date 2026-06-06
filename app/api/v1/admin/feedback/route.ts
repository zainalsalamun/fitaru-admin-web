import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import { createAuditLog, getAdminFeedback, updateAdminFeedback } from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { feedback } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi("Feedback");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: feedback,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminFeedback(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FEEDBACK_QUERY_FAILED",
      details: error,
      message: "Failed to load admin feedback.",
    });
  }
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readFeedbackPayload(payload: Record<string, unknown>) {
  const adminNote = readString(payload.adminNote);
  const id = readString(payload.id);
  const status = readString(payload.status, "open");

  if (!id || !status) {
    throw new Error("Feedback id and status are required.");
  }

  return {
    adminNote: adminNote || null,
    id,
    status,
  };
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Feedback");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiError({
      code: "SUPABASE_ADMIN_NOT_CONFIGURED",
      message: "Supabase admin env is required to update feedback.",
      status: 503,
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readFeedbackPayload(payload);

    await updateAdminFeedback(input.id, {
      adminNote: input.adminNote,
      status: input.status,
    });
    await createAuditLog({
      action: "update",
      adminUserId: auth.session.id,
      metadata: { status: input.status },
      resourceId: input.id,
      resourceType: "feedback",
    });

    return apiSuccess({
      items: await getAdminFeedback(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FEEDBACK_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin feedback.",
    });
  }
}
