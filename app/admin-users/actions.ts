"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminAccount,
  createAuditLog,
  deleteAdminAccount,
  updateAdminAccount,
} from "@/lib/admin-repository";
import { requireSuperAdmin } from "@/lib/auth/session";

function readAdminAccountForm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "admin").trim();
  const status = String(formData.get("status") ?? "active").trim();

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

export async function createAdminAccountAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const input = readAdminAccountForm(formData);
  await createAdminAccount(input);
  await createAuditLog({
    action: "create",
    adminUserId: admin.id,
    metadata: { email: input.email, role: input.role, status: input.status },
    resourceType: "admin_user",
  });
  revalidatePath("/admin-users");
  redirect("/admin-users");
}

export async function updateAdminAccountAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Admin account id is required.");
  }

  const input = readAdminAccountForm(formData);

  if (id === admin.id && (input.role !== "super_admin" || input.status !== "active")) {
    throw new Error("Super admin cannot downgrade or deactivate their own account.");
  }

  await updateAdminAccount(id, input);
  await createAuditLog({
    action: "update",
    adminUserId: admin.id,
    metadata: { email: input.email, role: input.role, status: input.status },
    resourceId: id,
    resourceType: "admin_user",
  });
  revalidatePath("/admin-users");
  redirect("/admin-users");
}

export async function deleteAdminAccountAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Admin account id is required.");
  }

  if (id === admin.id) {
    throw new Error("Super admin cannot delete their own account.");
  }

  await deleteAdminAccount(id);
  await createAuditLog({
    action: "delete",
    adminUserId: admin.id,
    resourceId: id,
    resourceType: "admin_user",
  });
  revalidatePath("/admin-users");
  redirect("/admin-users");
}
