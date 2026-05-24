import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminFeedback } from "@/lib/admin-repository";
import { feedback } from "@/lib/dashboard-data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { updateFeedbackAction } from "./actions";

export const dynamic = "force-dynamic";

async function getFeedback() {
  if (!hasSupabaseAdminEnv()) {
    return feedback;
  }

  try {
    return await getAdminFeedback();
  } catch {
    return feedback;
  }
}

type FeedbackItem = Awaited<ReturnType<typeof getFeedback>>[number];
type EditableFeedbackItem = FeedbackItem & {
  adminNote: string;
  id: string;
  statusValue: string;
};

function isEditableFeedbackItem(item: FeedbackItem | undefined): item is EditableFeedbackItem {
  return Boolean(item && "id" in item);
}

interface FeedbackPageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams;
  const items = await getFeedback();
  const candidateItem = params?.edit
    ? items.find((item) => "id" in item && item.id === params.edit)
    : undefined;
  const editedItem = isEditableFeedbackItem(candidateItem) ? candidateItem : undefined;

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
            {items.length === 0 ? (
              <div className="feedback-item">
                <div className="feedback-head">
                  <strong>Belum ada feedback.</strong>
                </div>
                <p>Feedback akan muncul setelah user mengirim masukan dari aplikasi mobile.</p>
              </div>
            ) : (
              items.map((item) => (
                <div className="feedback-item" key={item.title}>
                  <div className="feedback-head">
                    <strong>{item.title}</strong>
                    <StatusBadge>{item.status}</StatusBadge>
                  </div>
                  <p>{item.message}</p>
                  <div className="feedback-footer">
                    <span>{item.user}</span>
                    {"id" in item && (
                      <a className="text-action" href={`/feedback?edit=${item.id}`}>
                        Kelola
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="panel form-panel">
          <div className="panel-head">
            <div>
              <h2>Admin Note</h2>
              <p>
                {editedItem
                  ? `Kelola feedback: ${editedItem.title}`
                  : "Pilih feedback untuk mengubah status dan catatan internal."}
              </p>
            </div>
          </div>
          <form action={updateFeedbackAction} className="form-grid">
            {editedItem && <input name="id" type="hidden" value={editedItem.id} />}
            <label>
              Status
              <select defaultValue={editedItem?.statusValue ?? "reviewed"} disabled={!editedItem} name="status">
                <option value="open">Open</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              Catatan
              <textarea
                defaultValue={editedItem?.adminNote ?? ""}
                disabled={!editedItem}
                name="adminNote"
                placeholder="Contoh: Masuk backlog food database."
                rows={6}
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" disabled={!editedItem} type="submit">
                Simpan Note
              </button>
              {editedItem && (
                <a className="secondary-button" href="/feedback">
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
