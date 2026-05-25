import { ActivityBars } from "@/components/admin/activity-bars";
import { AdminPage } from "@/components/admin/admin-page";
import { StatCard } from "@/components/admin/stat-card";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminOverview } from "@/lib/admin-repository";
import {
  articles,
  feedback,
  quickActions,
  stats,
  topFoods,
} from "@/lib/dashboard-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

async function getOverviewData() {
  if (!hasSupabaseAdminEnv()) {
    return {
      articles,
      feedback,
      stats,
      topFoods,
    };
  }

  try {
    const overview = await getAdminOverview();

    return {
      articles: overview.articles,
      feedback: overview.recentFeedback,
      stats: [
        {
          icon: "◎",
          label: "Total User",
          note: "Dari Supabase",
          value: overview.stats.totalUsers,
        },
        {
          icon: "◷",
          label: "Active Today",
          note: "Status active",
          value: overview.stats.activeUsersToday,
        },
        {
          icon: "◍",
          label: "Meal Logs",
          note: "hari ini",
          value: overview.stats.mealLogsToday,
        },
        {
          icon: "☰",
          label: "Feedback Baru",
          note: "Status open",
          value: overview.stats.feedbackNew,
        },
      ],
      topFoods: overview.topFoods,
    };
  } catch {
    return {
      articles,
      feedback,
      stats,
      topFoods,
    };
  }
}

export default async function AdminOverviewPage() {
  const overview = await getOverviewData();

  return (
    <AdminPage
      active="Overview"
      action={<a className="primary-button" href="/content">+ Buat Konten</a>}
      description="Ringkasan performa aplikasi Fitaru hari ini."
      title="Overview Dashboard"
    >
      <section className="stats-grid" aria-label="Key metrics">
          {overview.stats.map((stat) => (
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
                <a href="/users">Lihat user</a>
              </div>
              <UserGrowthChart />
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Content Management</h2>
                  <p>Artikel tips dan edukasi yang tampil di aplikasi.</p>
                </div>
                <a href="/content">Lihat semua</a>
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
                    {overview.articles.length === 0 ? (
                      <tr>
                        <td className="muted" colSpan={5}>
                          Belum ada artikel.
                        </td>
                      </tr>
                    ) : (
                      overview.articles.map((article) => (
                        <tr key={article.title}>
                          <td>{article.title}</td>
                          <td className="muted">{article.category}</td>
                          <td>
                            <StatusBadge>{article.status}</StatusBadge>
                          </td>
                          <td className="muted">{article.author}</td>
                          <td className="muted">{article.updated}</td>
                        </tr>
                      ))
                    )}
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
                <a href="/food-database">Kelola</a>
              </div>
              <div className="list">
                {overview.topFoods.length === 0 ? (
                  <div className="list-item">
                    <div>
                      <strong>Belum ada makanan.</strong>
                      <span>Data akan muncul dari database referensi.</span>
                    </div>
                  </div>
                ) : (
                  overview.topFoods.map((food) => (
                    <div className="list-item" key={food.name}>
                      <div>
                        <strong>{food.name}</strong>
                        <span>{food.meta}</span>
                      </div>
                      <StatusBadge>{food.logs}</StatusBadge>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Activity Logs</h2>
                  <p>Pencatatan olahraga 7 hari terakhir.</p>
                </div>
                <a href="/exercise-database">Kelola</a>
              </div>
              <ActivityBars />
            </article>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <h2>Recent Feedback</h2>
                  <p>Masukan terbaru dari user.</p>
                </div>
                <a href="/feedback">Kelola</a>
              </div>
              <div className="list">
                {overview.feedback.length === 0 ? (
                  <div className="feedback-item">
                    <div className="feedback-head">
                      <strong>Belum ada feedback.</strong>
                    </div>
                    <p>Feedback terbaru akan muncul di sini.</p>
                  </div>
                ) : (
                  overview.feedback.map((item) => (
                    <div className="feedback-item" key={item.title}>
                      <div className="feedback-head">
                        <strong>{item.title}</strong>
                        <StatusBadge>{item.status}</StatusBadge>
                      </div>
                      <p>{item.message}</p>
                      <span>{item.user}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </aside>
      </section>
    </AdminPage>
  );
}
