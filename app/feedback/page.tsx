import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { feedback } from "@/lib/dashboard-data";

export default function FeedbackPage() {
  return (
    <AdminPage
      active="Feedback"
      action={<button className="secondary-button">Export</button>}
      description="Kelola masukan user dari aplikasi mobile."
      title="Feedback"
    >
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Inbox Feedback</h2>
              <p>Tandai open, reviewed, resolved, atau archived.</p>
            </div>
            <a href="#">Filter open</a>
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

        <aside className="panel form-panel">
          <div className="panel-head">
            <div>
              <h2>Admin Note</h2>
              <p>Catatan internal untuk feedback terpilih.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Status
              <select defaultValue="reviewed">
                <option value="open">Open</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
            <label>
              Catatan
              <textarea placeholder="Contoh: Masuk backlog food database." rows={6} />
            </label>
            <button className="primary-button">Simpan Note</button>
          </div>
        </aside>
      </section>
    </AdminPage>
  );
}
