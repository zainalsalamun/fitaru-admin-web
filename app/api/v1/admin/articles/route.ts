import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import {
  createAdminArticle,
  createAuditLog,
  deleteAdminArticle,
  getAdminArticles,
  updateAdminArticle,
} from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { articles } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi("Content");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: articles,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminArticles(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ARTICLES_QUERY_FAILED",
      details: error,
      message: "Failed to load admin articles.",
    });
  }
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function readArticlePayload(payload: Record<string, unknown>) {
  const categoryId = readString(payload.categoryId);
  const content = readString(payload.content);
  const status = readString(payload.status, "draft");
  const summary = readString(payload.summary);
  const title = readString(payload.title);

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

function readId(payload: Record<string, unknown>) {
  const id = readString(payload.id);

  if (!id) {
    throw new Error("Article id is required.");
  }

  return id;
}

function mutationUnavailable(message: string) {
  return apiError({
    code: "SUPABASE_ADMIN_NOT_CONFIGURED",
    message,
    status: 503,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi("Content");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to create articles.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const input = readArticlePayload(payload);

    await createAdminArticle(input);
    await createAuditLog({
      action: input.status === "published" ? "publish" : "create",
      adminUserId: auth.session.id,
      metadata: { status: input.status, title: input.title },
      resourceType: "article",
    });

    return apiSuccess({
      items: await getAdminArticles(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ARTICLE_CREATE_FAILED",
      details: error,
      message: "Failed to create admin article.",
    });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("Content");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to update articles.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);
    const input = readArticlePayload(payload);

    await updateAdminArticle(id, input);
    await createAuditLog({
      action: input.status === "published" ? "publish" : "update",
      adminUserId: auth.session.id,
      metadata: { status: input.status, title: input.title },
      resourceId: id,
      resourceType: "article",
    });

    return apiSuccess({
      items: await getAdminArticles(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ARTICLE_UPDATE_FAILED",
      details: error,
      message: "Failed to update admin article.",
    });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi("Content");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return mutationUnavailable("Supabase admin env is required to delete articles.");
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const id = readId(payload);

    await deleteAdminArticle(id);
    await createAuditLog({
      action: "delete",
      adminUserId: auth.session.id,
      resourceId: id,
      resourceType: "article",
    });

    return apiSuccess({
      items: await getAdminArticles(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_ARTICLE_DELETE_FAILED",
      details: error,
      message: "Failed to delete admin article.",
    });
  }
}
