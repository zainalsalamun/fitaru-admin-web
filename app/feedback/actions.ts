"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateAdminFeedback } from "@/lib/admin-repository";
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
  await requireAdmin("Feedback");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Feedback id is required.");
  }

  await updateAdminFeedback(id, readFeedbackForm(formData));
  revalidatePath("/");
  revalidatePath("/feedback");
  redirect("/feedback");
}
