import { AdminPage } from "@/components/admin/admin-page";
import { CustomSelect } from "@/components/ui/custom-select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getAdminArticles,
  getContentCategories,
} from "@/lib/admin-repository";
import { articles } from "@/lib/dashboard-data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  createArticleAction,
  deleteArticleAction,
  updateArticleAction,
} from "./actions";

export const dynamic = "force-dynamic";

async function getArticles() {
  if (!hasSupabaseAdminEnv()) {
    return articles;
  }

  try {
    return await getAdminArticles();
  } catch {
    return articles;
  }
}

async function getCategories() {
  if (!hasSupabaseAdminEnv()) {
    return [
      { id: "makan-santai", name: "Makan santai", slug: "makan-santai" },
      { id: "olahraga-pemula", name: "Olahraga pemula", slug: "olahraga-pemula" },
      { id: "kurangi-gula", name: "Kurangi gula", slug: "kurangi-gula" },
    ];
  }

  try {
    return await getContentCategories();
  } catch {
    return [];
  }
}

type ArticleItem = Awaited<ReturnType<typeof getArticles>>[number];
type EditableArticle = ArticleItem & {
  categoryId: string;
  content: string;
  id: string;
  statusValue: string;
  summary: string;
};

function isEditableArticle(article: ArticleItem | undefined): article is EditableArticle {
  return Boolean(article && "id" in article);
}

interface ContentPageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  const articleItems = await getArticles();
  const categories = await getCategories();
  const candidateArticle = params?.edit
    ? articleItems.find((article) => "id" in article && article.id === params.edit)
    : undefined;
  const editedArticle = isEditableArticle(candidateArticle) ? candidateArticle : undefined;
  const isEditing = Boolean(editedArticle);

  return (
    <AdminPage
      active="Content"
      action={<a className="primary-button" href="/content">+ Artikel Baru</a>}
      description="Kelola artikel tips yang tampil di aplikasi mobile."
      title="Content Management"
    >
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Artikel Tips</h2>
              <p>Draft, review, publish, dan archive konten edukasi.</p>
            </div>
            <a href="#">Preview mobile</a>
          </div>

          <div className="segments">
            <span className="active">Semua</span>
            <span>Published</span>
            <span>Draft</span>
            <span>Review</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Update</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {articleItems.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={6}>
                      Belum ada artikel.
                    </td>
                  </tr>
                ) : (
                  articleItems.map((article) => (
                    <tr key={article.title}>
                      <td>{article.title}</td>
                      <td className="muted">{article.category}</td>
                      <td>
                        <StatusBadge>{article.status}</StatusBadge>
                      </td>
                      <td className="muted">{article.author}</td>
                      <td className="muted">{article.updated}</td>
                      <td>
                        {"id" in article ? (
                          <div className="row-actions">
                            <a className="text-action" href={`/content?edit=${article.id}`}>
                              Edit
                            </a>
                            <form action={deleteArticleAction}>
                              <input name="id" type="hidden" value={article.id} />
                              <button className="danger-action" type="submit">
                                Hapus
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel form-panel">
          <div className="panel-head">
            <div>
              <h2>{isEditing ? "Edit Artikel" : "Editor Cepat"}</h2>
              <p>{isEditing ? "Update konten yang sudah tersimpan." : "Draft awal untuk artikel baru."}</p>
            </div>
          </div>
          <form action={isEditing ? updateArticleAction : createArticleAction} className="form-grid">
            {editedArticle && <input name="id" type="hidden" value={editedArticle.id} />}
            <label>
              Judul
              <input
                defaultValue={editedArticle?.title ?? ""}
                name="title"
                placeholder="Contoh: Cara tetap makan nasi saat diet"
                required
              />
            </label>
            <label>
              Kategori
              <CustomSelect
                defaultValue={editedArticle?.categoryId ?? categories[0]?.id ?? ""}
                name="categoryId"
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
                required
              />
            </label>
            <label>
              Status
              <CustomSelect
                defaultValue={editedArticle?.statusValue ?? "draft"}
                name="status"
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Review", value: "review" },
                  { label: "Published", value: "published" },
                  { label: "Archived", value: "archived" },
                ]}
              />
            </label>
            <label>
              Ringkasan
              <textarea
                defaultValue={editedArticle?.summary ?? ""}
                name="summary"
                placeholder="Tulis ringkasan pendek..."
                required
                rows={4}
              />
            </label>
            <label>
              Konten
              <textarea
                defaultValue={editedArticle?.content ?? ""}
                name="content"
                placeholder="Tulis isi artikel..."
                required
                rows={8}
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                {isEditing ? "Update Artikel" : "Simpan Artikel"}
              </button>
              {isEditing && (
                <a className="secondary-button" href="/content">
                  Batal
                </a>
              )}
            </div>
          </form>
        </aside>
      </section>
    </AdminPage>
  );
}
