import { ActivityBars } from "@/components/admin/activity-bars";
import { AdminPage } from "@/components/admin/admin-page";
import { StatCard } from "@/components/admin/stat-card";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  articles,
  feedback,
  quickActions,
  stats,
  topFoods,
} from "@/lib/dashboard-data";

export default function AdminOverviewPage() {
  return (
    <AdminPage
      active="Overview"
      action={<button className="primary-button">+ Buat Konten</button>}
      description="Ringkasan performa aplikasi Fitaru hari ini."
      title="Overview Dashboard"
    >
      <section className="stats-grid" aria-label="Key metrics">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
      </section>

      <section className="content-grid">
          <div className="stack">
            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>User Growth</h2>
                  <p>Pertumbuhan user 7 hari terakhir.</p>
                </div>
                <a href="#">Export</a>
              </div>
              <UserGrowthChart />
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Content Management</h2>
                  <p>Artikel tips dan edukasi yang tampil di aplikasi.</p>
                </div>
                <a href="#">Lihat semua</a>
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
          </div>

          <aside className="stack">
            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Aksi admin yang paling sering dipakai.</p>
                </div>
              </div>
              <div className="quick-grid">
                {quickActions.map((action) => (
                  <button className="quick-action" key={action.title}>
                    <strong>{action.title}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Top Foods</h2>
                  <p>Makanan paling sering dicatat minggu ini.</p>
                </div>
              </div>
              <div className="list">
                {topFoods.map((food) => (
                  <div className="list-item" key={food.name}>
                    <div>
                      <strong>{food.name}</strong>
                      <span>{food.meta}</span>
                    </div>
                    <StatusBadge>{food.logs}</StatusBadge>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Activity Logs</h2>
                  <p>Pencatatan olahraga 7 hari terakhir.</p>
                </div>
              </div>
              <ActivityBars />
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Recent Feedback</h2>
                  <p>Masukan terbaru dari user.</p>
                </div>
                <a href="#">Kelola</a>
              </div>
              <div className="list">
                {feedback.map((item) => (
                  <div className="feedback-item" key={item.title}>
                    <div className="feedback-head">
                      <strong>{item.title}</strong>
                      <StatusBadge>{item.status}</StatusBadge>
                    </div>
                    <p>{item.message}</p>
                    <span>{item.user}</span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
      </section>
    </AdminPage>
  );
}
