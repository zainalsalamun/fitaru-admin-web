"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminAccount,
  deleteAdminAccount,
  updateAdminAccount,
} from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

function readAdminAccountForm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "support_admin").trim();
  const status = String(formData.get("status") ?? "active").trim();

  if (!email || !name || !role || !status) {
    throw new Error("Admin name, email, role, and status are required.");
  }

  return {
    email,
    name,
    role,
    status,
  };
}

export async function createAdminAccountAction(formData: FormData) {
  await requireAdmin("Admin Users");
  await createAdminAccount(readAdminAccountForm(formData));
  revalidatePath("/admin-users");
  redirect("/admin-users");
}

export async function updateAdminAccountAction(formData: FormData) {
  await requireAdmin("Admin Users");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Admin account id is required.");
  }

  await updateAdminAccount(id, readAdminAccountForm(formData));
  revalidatePath("/admin-users");
  redirect("/admin-users");
}

export async function deleteAdminAccountAction(formData: FormData) {
  await requireAdmin("Admin Users");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Admin account id is required.");
  }

  await deleteAdminAccount(id);
  revalidatePath("/admin-users");
  redirect("/admin-users");
}
