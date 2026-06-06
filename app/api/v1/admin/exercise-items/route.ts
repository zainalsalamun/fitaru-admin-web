import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import {
  createAdminExerciseItem,
  createAuditLog,
  deleteAdminExerciseItem,
  getAdminExerciseItems,
  updateAdminExerciseItem,
} from "@/lib/admin-repository";
import { exerciseItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi("Exercise Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: exerciseItems,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminExerciseItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_EXERCISE_ITEMS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin exercise items.",
    });
  }
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("Numeric exercise values must be numbers.");
  }

  return value;
}

function readRequiredNumber(value: unknown, key: string) {
  const numberValue = readNumber(value);

  if (numberValue === null) {
    throw new Error(`${key} is required.`);
  }

  return numberValue;
}

function readExercisePayload(payload: Record<string, unknown>) {
  const category = readString(payload.category);
  const defaultIntensity = readString(payload.defaultIntensity, "medium");
  const name = readString(payload.name);
  const notes = readString(payload.notes);
  const status = readString(payload.status, "active");

  if (!category || !defaultIntensity || !name || !status) {
    throw new Error("Exercise name, category, intensity, and status are required.");
  }

  return {
    caloriesPer30Minutes: readNumber(payload.caloriesPer30Minutes),
    category,
    defaultDurationMinutes: readRequiredNumber(
      payload.defaultDurationMinutes,
      "defaultDurationMinutes",
    ),
    defaultIntensity,
    name,
    notes: notes || null,
    status,
  };
}

function readId(payload: Record<string, unknown>) {
  const id = readString(payload.id);

  if (!id) {
    throw new Error("Exercise item id is required.");
  }

  return id;
}

function mutationUnavailable(message: string) {
  return apiError({
    code: "SUPABASE_ADMIN_NOT_CONFIGURED",
    message,
    status: 503,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi("Exercise Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to create exercise items.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readExercisePayload(payload);

    await createAdminExerciseItem(input);
    await createAuditLog({
      action: "create",
      adminUserId: auth.session.id,
      metadata: { category: input.category, name: input.name, status: input.status },
      resourceType: "exercise_item",
    });

    return apiSuccess({
      items: await getAdminExerciseItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_EXERCISE_ITEM_CREATE_FAILED",
      details: error,
      message: "Failed to create admin exercise item.",
    });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Exercise Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to update exercise items.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);
    const input = readExercisePayload(payload);

    await updateAdminExerciseItem(id, input);
    await createAuditLog({
      action: "update",
      adminUserId: auth.session.id,
      metadata: { category: input.category, name: input.name, status: input.status },
      resourceId: id,
      resourceType: "exercise_item",
    });

    return apiSuccess({
      items: await getAdminExerciseItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_EXERCISE_ITEM_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin exercise item.",
    });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi("Exercise Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to delete exercise items.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);

    await deleteAdminExerciseItem(id);
    await createAuditLog({
      action: "delete",
      adminUserId: auth.session.id,
      resourceId: id,
      resourceType: "exercise_item",
    });

    return apiSuccess({
      items: await getAdminExerciseItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_EXERCISE_ITEM_DELETE_FAILED",
      details: error,
      message: "Failed to delete admin exercise item.",
    });
  }
}
