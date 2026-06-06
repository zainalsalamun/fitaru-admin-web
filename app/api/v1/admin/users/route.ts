import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import { createAuditLog, getAdminUsers, updateAdminUserStatus } from "@/lib/admin-repository";
import { users } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi("Users");

  if (auth.error) {
    return auth.error;
  }

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

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readUserStatusPayload(payload: Record<string, unknown>) {
  const id = readString(payload.id);
  const status = readString(payload.status);

  if (!id || !status) {
    throw new Error("User id and status are required.");
  }

  return {
    id,
    status,
  };
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Users");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiError({
      code: "SUPABASE_ADMIN_NOT_CONFIGURED",
      message: "Supabase admin env is required to update users.",
      status: 503,
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readUserStatusPayload(payload);

    await updateAdminUserStatus(input.id, input.status);
    await createAuditLog({
      action: input.status === "suspended" ? "suspend" : "update",
      adminUserId: auth.session.id,
      metadata: { status: input.status },
      resourceId: input.id,
      resourceType: "user",
    });

    return apiSuccess({
      items: await getAdminUsers(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_USER_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin user.",
    });
  }
}
