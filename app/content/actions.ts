"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminArticle,
  createAuditLog,
  deleteAdminArticle,
  updateAdminArticle,
} from "@/lib/admin-repository";
import { requireAdmin } from "@/lib/auth/session";

function readArticleForm(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!categoryId || !content || !summary || !title) {
    throw new Error("Article title, category, summary, and content are required.");
  }

  return {
    categoryId,
    content,
    status,
    summary,
    title,
  };
}

export async function createArticleAction(formData: FormData) {
  const admin = await requireAdmin("Content");
  const input = readArticleForm(formData);
  await createAdminArticle(input);
  await createAuditLog({
    action: input.status === "published" ? "publish" : "create",
    adminUserId: admin.id,
    metadata: { status: input.status, title: input.title },
    resourceType: "article",
  });
  revalidatePath("/");
  revalidatePath("/content");
  redirect("/content");
}

export async function updateArticleAction(formData: FormData) {
  const admin = await requireAdmin("Content");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Article id is required.");
  }

  const input = readArticleForm(formData);
  await updateAdminArticle(id, input);
  await createAuditLog({
    action: input.status === "published" ? "publish" : "update",
    adminUserId: admin.id,
    metadata: { status: input.status, title: input.title },
    resourceId: id,
    resourceType: "article",
  });
  revalidatePath("/");
  revalidatePath("/content");
  redirect("/content");
}

export async function deleteArticleAction(formData: FormData) {
  const admin = await requireAdmin("Content");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Article id is required.");
  }

  await deleteAdminArticle(id);
  await createAuditLog({
    action: "delete",
    adminUserId: admin.id,
    resourceId: id,
    resourceType: "article",
  });
  revalidatePath("/");
  revalidatePath("/content");
  redirect("/content");
}
