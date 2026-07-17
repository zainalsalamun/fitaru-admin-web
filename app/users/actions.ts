"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog, updateAdminUserStatus } from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

export async function updateUserStatusAction(formData: FormData) {
  const admin = await requireAdmin("Users");
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !status) {
    throw new Error("User id and status are required.");
  }

  await updateAdminUserStatus(id, status);
  await createAuditLog({
    action: status === "suspended" ? "suspend" : "update",
    adminUserId: admin.id,
    metadata: { status },
    resourceId: id,
    resourceType: "user",
  });
  revalidatePath("/");
  revalidatePath("/users");
  redirect("/users");
}
