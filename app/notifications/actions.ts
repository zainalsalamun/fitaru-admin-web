"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminNotification,
  createAuditLog,
  deleteAdminNotification,
  updateAdminNotification,
} from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

function readNotificationForm(formData: FormData) {
  const message = String(formData.get("message") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const targetSegment = String(formData.get("targetSegment") ?? "all").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!message || !status || !targetSegment || !title) {
    throw new Error("Notification title, message, segment, and status are required.");
  }

  return {
    message,
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    status,
    targetSegment,
    title,
  };
}

export async function createNotificationAction(formData: FormData) {
  const admin = await requireAdmin("Notifications");
  const input = readNotificationForm(formData);
  await createAdminNotification(input);
  await createAuditLog({
    action: "create",
    adminUserId: admin.id,
    metadata: { status: input.status, targetSegment: input.targetSegment, title: input.title },
    resourceType: "notification",
  });
  revalidatePath("/notifications");
  redirect("/notifications");
}

export async function updateNotificationAction(formData: FormData) {
  const admin = await requireAdmin("Notifications");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Notification id is required.");
  }

  const input = readNotificationForm(formData);
  await updateAdminNotification(id, input);
  await createAuditLog({
    action: "update",
    adminUserId: admin.id,
    metadata: { status: input.status, targetSegment: input.targetSegment, title: input.title },
    resourceId: id,
    resourceType: "notification",
  });
  revalidatePath("/notifications");
  redirect("/notifications");
}

export async function deleteNotificationAction(formData: FormData) {
  const admin = await requireAdmin("Notifications");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Notification id is required.");
  }

  await deleteAdminNotification(id);
  await createAuditLog({
    action: "delete",
    adminUserId: admin.id,
    resourceId: id,
    resourceType: "notification",
  });
  revalidatePath("/notifications");
  redirect("/notifications");
}
