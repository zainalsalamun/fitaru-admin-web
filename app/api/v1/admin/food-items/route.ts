import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import {
  createAdminFoodItem,
  createAuditLog,
  deleteAdminFoodItem,
  getAdminFoodItems,
  updateAdminFoodItem,
} from "@/lib/admin-repository";
import { foodItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi("Food Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: foodItems,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminFoodItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FOOD_ITEMS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin food items.",
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
    throw new Error("Numeric food values must be numbers.");
  }

  return value;
}

function readFoodPayload(payload: Record<string, unknown>) {
  const category = readString(payload.category);
  const defaultPortion = readString(payload.defaultPortion, "medium");
  const name = readString(payload.name);
  const notes = readString(payload.notes);
  const status = readString(payload.status, "active");

  if (!category || !defaultPortion || !name || !status) {
    throw new Error("Food name, category, portion, and status are required.");
  }

  return {
    caloriesPerPortion: readNumber(payload.caloriesPerPortion),
    carbsG: readNumber(payload.carbsG),
    category,
    defaultPortion,
    fatG: readNumber(payload.fatG),
    name,
    notes: notes || null,
    proteinG: readNumber(payload.proteinG),
    status,
  };
}

function readId(payload: Record<string, unknown>) {
  const id = readString(payload.id);

  if (!id) {
    throw new Error("Food item id is required.");
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
  const auth = await requireAdminApi("Food Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to create food items.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readFoodPayload(payload);

    await createAdminFoodItem(input);
    await createAuditLog({
      action: "create",
      adminUserId: auth.session.id,
      metadata: { category: input.category, name: input.name, status: input.status },
      resourceType: "food_item",
    });

    return apiSuccess({
      items: await getAdminFoodItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FOOD_ITEM_CREATE_FAILED",
      details: error,
      message: "Failed to create admin food item.",
    });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Food Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to update food items.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);
    const input = readFoodPayload(payload);

    await updateAdminFoodItem(id, input);
    await createAuditLog({
      action: "update",
      adminUserId: auth.session.id,
      metadata: { category: input.category, name: input.name, status: input.status },
      resourceId: id,
      resourceType: "food_item",
    });

    return apiSuccess({
      items: await getAdminFoodItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FOOD_ITEM_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin food item.",
    });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi("Food Database");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to delete food items.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);

    await deleteAdminFoodItem(id);
    await createAuditLog({
      action: "delete",
      adminUserId: auth.session.id,
      resourceId: id,
      resourceType: "food_item",
    });

    return apiSuccess({
      items: await getAdminFoodItems(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_FOOD_ITEM_DELETE_FAILED",
      details: error,
      message: "Failed to delete admin food item.",
    });
  }
}
