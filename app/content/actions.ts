"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminArticle,
  deleteAdminArticle,
  updateAdminArticle,
} from "@/lib/admin-repository";

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
  await createAdminArticle(readArticleForm(formData));
  revalidatePath("/");
  revalidatePath("/content");
  redirect("/content");
}

export async function updateArticleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Article id is required.");
  }

  await updateAdminArticle(id, readArticleForm(formData));
  revalidatePath("/");
  revalidatePath("/content");
  redirect("/content");
}

export async function deleteArticleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Article id is required.");
  }

  await deleteAdminArticle(id);
  revalidatePath("/");
  revalidatePath("/content");
  redirect("/content");
}
