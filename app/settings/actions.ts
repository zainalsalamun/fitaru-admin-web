"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog, updateAppSettings } from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

function readNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${key} must be a positive number.`);
  }

  return value;
}

function readSettingsForm(formData: FormData) {
  const appName = String(formData.get("appName") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const supportEmail = String(formData.get("supportEmail") ?? "").trim().toLowerCase();
  const maintenanceMessage = String(formData.get("maintenanceMessage") ?? "").trim();

  if (!appName || !tagline || !supportEmail) {
    throw new Error("App name, tagline, and support email are required.");
  }

  return {
    appName,
    defaultCalorieTarget: readNumber(formData, "defaultCalorieTarget"),
    defaultExerciseWeeklyTarget: readNumber(formData, "defaultExerciseWeeklyTarget"),
    defaultWaterGlassesTarget: readNumber(formData, "defaultWaterGlassesTarget"),
    maintenanceEnabled: formData.get("maintenanceEnabled") === "on",
    maintenanceMessage,
    reminderExerciseEnabled: formData.get("reminderExerciseEnabled") === "on",
    reminderMealEnabled: formData.get("reminderMealEnabled") === "on",
    reminderWaterEnabled: formData.get("reminderWaterEnabled") === "on",
    supportEmail,
    tagline,
  };
}

export async function updateSettingsAction(formData: FormData) {
  const admin = await requireAdmin("Settings");
  const input = readSettingsForm(formData);
  await updateAppSettings(input);
  await createAuditLog({
    action: "update",
    adminUserId: admin.id,
    metadata: {
      appName: input.appName,
      maintenanceEnabled: input.maintenanceEnabled,
    },
    resourceId: "main",
    resourceType: "settings",
  });
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
