import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { articles } from "@/lib/dashboard-data";

export default function ContentPage() {
  return (
    <AdminPage
      active="Content"
      action={<button className="primary-button">+ Artikel Baru</button>}
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
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.title}>
                    <td>{article.title}</td>
                    <td className="muted">{article.category}</td>
                    <td>
                      <StatusBadge>{article.status}</StatusBadge>
                    </td>
                    <td className="muted">{article.author}</td>
                    <td className="muted">{article.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel form-panel">
          <div className="panel-head">
            <div>
              <h2>Editor Cepat</h2>
              <p>Draft awal untuk artikel baru.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Judul
              <input placeholder="Contoh: Cara tetap makan nasi saat diet" />
            </label>
            <label>
              Kategori
              <select defaultValue="makan-santai">
                <option value="makan-santai">Makan santai</option>
                <option value="olahraga-pemula">Olahraga pemula</option>
                <option value="kurangi-gula">Kurangi gula</option>
              </select>
            </label>
            <label>
              Ringkasan
              <textarea placeholder="Tulis ringkasan pendek..." rows={5} />
            </label>
            <button className="primary-button">Simpan Draft</button>
          </div>
        </aside>
      </section>
    </AdminPage>
  );
}
