import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import {
  createAdminAccount,
  createAuditLog,
  deleteAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
} from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readId(payload: Record<string, unknown>) {
  const id = readString(payload.id);

  if (!id) {
    throw new Error("Admin account id is required.");
  }

  return id;
}

function readAdminAccountPayload(payload: Record<string, unknown>) {
  const email = readString(payload.email).toLowerCase();
  const name = readString(payload.name);
  const role = readString(payload.role, "admin");
  const status = readString(payload.status, "active");

  if (!email || !name || !role || !status) {
    throw new Error("Admin name, email, role, and status are required.");
  }

  if (!["admin", "super_admin"].includes(role)) {
    throw new Error("Admin role is not allowed.");
  }

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Admin status is not allowed.");
  }

  return {
    email,
    name,
    role,
    status,
  };
}

function mutationUnavailable(message: string) {
  return apiError({
    code: "SUPABASE_ADMIN_NOT_CONFIGURED",
    message,
    status: 503,
  });
}

export async function GET() {
  const auth = await requireAdminApi("Admin Users");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: [],
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminAccounts(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ACCOUNTS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin accounts.",
    });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi("Admin Users");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to create admin accounts.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readAdminAccountPayload(payload);

    await createAdminAccount(input);
    await createAuditLog({
      action: "create",
      adminUserId: auth.session.id,
      metadata: { email: input.email, role: input.role, status: input.status },
      resourceType: "admin_user",
    });

    return apiSuccess({
      items: await getAdminAccounts(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ACCOUNT_CREATE_FAILED",
      details: error,
      message: "Failed to create admin account.",
    });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Admin Users");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to update admin accounts.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);
    const input = readAdminAccountPayload(payload);

    if (id === auth.session.id && (input.role !== "super_admin" || input.status !== "active")) {
      throw new Error("Super admin cannot downgrade or deactivate their own account.");
    }

    await updateAdminAccount(id, input);
    await createAuditLog({
      action: "update",
      adminUserId: auth.session.id,
      metadata: { email: input.email, role: input.role, status: input.status },
      resourceId: id,
      resourceType: "admin_user",
    });

    return apiSuccess({
      items: await getAdminAccounts(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ACCOUNT_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin account.",
    });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi("Admin Users");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to delete admin accounts.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);

    if (id === auth.session.id) {
      throw new Error("Super admin cannot delete their own account.");
    }

    await deleteAdminAccount(id);
    await createAuditLog({
      action: "delete",
      adminUserId: auth.session.id,
      resourceId: id,
      resourceType: "admin_user",
    });

    return apiSuccess({
      items: await getAdminAccounts(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ACCOUNT_DELETE_FAILED",
      details: error,
      message: "Failed to delete admin account.",
    });
  }
}
