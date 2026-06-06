"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminExerciseItem,
  createAuditLog,
  deleteAdminExerciseItem,
  updateAdminExerciseItem,
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

function readRequiredNumber(formData: FormData, key: string) {
  const value = readNumber(formData, key);

  if (value === null) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function readExerciseForm(formData: FormData) {
  const category = String(formData.get("category") ?? "").trim();
  const defaultIntensity = String(formData.get("defaultIntensity") ?? "medium").trim();
  const name = String(formData.get("name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();

  if (!category || !defaultIntensity || !name || !status) {
    throw new Error("Exercise name, category, intensity, and status are required.");
  }

  return {
    caloriesPer30Minutes: readNumber(formData, "caloriesPer30Minutes"),
    category,
    defaultDurationMinutes: readRequiredNumber(formData, "defaultDurationMinutes"),
    defaultIntensity,
    name,
    notes: notes || null,
    status,
  };
}

export async function createExerciseItemAction(formData: FormData) {
  const admin = await requireAdmin("Exercise Database");
  const input = readExerciseForm(formData);
  await createAdminExerciseItem(input);
  await createAuditLog({
    action: "create",
    adminUserId: admin.id,
    metadata: { category: input.category, name: input.name, status: input.status },
    resourceType: "exercise_item",
  });
  revalidatePath("/");
  revalidatePath("/exercise-database");
  redirect("/exercise-database");
}

export async function updateExerciseItemAction(formData: FormData) {
  const admin = await requireAdmin("Exercise Database");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Exercise item id is required.");
  }

  const input = readExerciseForm(formData);
  await updateAdminExerciseItem(id, input);
  await createAuditLog({
    action: "update",
    adminUserId: admin.id,
    metadata: { category: input.category, name: input.name, status: input.status },
    resourceId: id,
    resourceType: "exercise_item",
  });
  revalidatePath("/");
  revalidatePath("/exercise-database");
  redirect("/exercise-database");
}

export async function deleteExerciseItemAction(formData: FormData) {
  const admin = await requireAdmin("Exercise Database");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Exercise item id is required.");
  }

  await deleteAdminExerciseItem(id);
  await createAuditLog({
    action: "delete",
    adminUserId: admin.id,
    resourceId: id,
    resourceType: "exercise_item",
  });
  revalidatePath("/");
  revalidatePath("/exercise-database");
  redirect("/exercise-database");
}
