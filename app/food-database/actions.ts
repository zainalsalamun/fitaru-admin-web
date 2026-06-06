"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminFoodItem,
  createAuditLog,
  deleteAdminFoodItem,
  updateAdminFoodItem,
} from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

function readNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    throw new Error(`${key} must be a number.`);
  }

  return numberValue;
}

function readFoodForm(formData: FormData) {
  const category = String(formData.get("category") ?? "").trim();
  const defaultPortion = String(formData.get("defaultPortion") ?? "medium").trim();
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();

  if (!category || !defaultPortion || !name || !status) {
    throw new Error("Food name, category, portion, and status are required.");
  }

  return {
    caloriesPerPortion: readNumber(formData, "caloriesPerPortion"),
    carbsG: readNumber(formData, "carbsG"),
    category,
    defaultPortion,
    fatG: readNumber(formData, "fatG"),
    name,
    notes: notes || null,
    proteinG: readNumber(formData, "proteinG"),
    status,
  };
}

export async function createFoodItemAction(formData: FormData) {
  const admin = await requireAdmin("Food Database");
  const input = readFoodForm(formData);
  await createAdminFoodItem(input);
  await createAuditLog({
    action: "create",
    adminUserId: admin.id,
    metadata: { category: input.category, name: input.name, status: input.status },
    resourceType: "food_item",
  });
  revalidatePath("/");
  revalidatePath("/food-database");
  redirect("/food-database");
}

export async function updateFoodItemAction(formData: FormData) {
  const admin = await requireAdmin("Food Database");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Food item id is required.");
  }

  const input = readFoodForm(formData);
  await updateAdminFoodItem(id, input);
  await createAuditLog({
    action: "update",
    adminUserId: admin.id,
    metadata: { category: input.category, name: input.name, status: input.status },
    resourceId: id,
    resourceType: "food_item",
  });
  revalidatePath("/");
  revalidatePath("/food-database");
  redirect("/food-database");
}

export async function deleteFoodItemAction(formData: FormData) {
  const admin = await requireAdmin("Food Database");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Food item id is required.");
  }

  await deleteAdminFoodItem(id);
  await createAuditLog({
    action: "delete",
    adminUserId: admin.id,
    resourceId: id,
    resourceType: "food_item",
  });
  revalidatePath("/");
  revalidatePath("/food-database");
  redirect("/food-database");
}
