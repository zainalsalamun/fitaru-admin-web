"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminFoodItem,
  deleteAdminFoodItem,
  updateAdminFoodItem,
} from "@/lib/admin-repository";

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
  await createAdminFoodItem(readFoodForm(formData));
  revalidatePath("/");
  revalidatePath("/food-database");
  redirect("/food-database");
}

export async function updateFoodItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Food item id is required.");
  }

  await updateAdminFoodItem(id, readFoodForm(formData));
  revalidatePath("/");
  revalidatePath("/food-database");
  redirect("/food-database");
}

export async function deleteFoodItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Food item id is required.");
  }

  await deleteAdminFoodItem(id);
  revalidatePath("/");
  revalidatePath("/food-database");
  redirect("/food-database");
}
