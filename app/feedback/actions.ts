"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog, updateAdminFeedback } from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

function readFeedbackForm(formData: FormData) {
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const status = String(formData.get("status") ?? "open").trim();

  if (!status) {
    throw new Error("Feedback status is required.");
  }

  return {
    adminNote: adminNote || null,
    status,
  };
}

export async function updateFeedbackAction(formData: FormData) {
  const admin = await requireAdmin("Feedback");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Feedback id is required.");
  }

  const input = readFeedbackForm(formData);
  await updateAdminFeedback(id, input);
  await createAuditLog({
    action: "update",
    adminUserId: admin.id,
    metadata: { status: input.status },
    resourceId: id,
    resourceType: "feedback",
  });
  revalidatePath("/");
  revalidatePath("/feedback");
  redirect("/feedback");
}
