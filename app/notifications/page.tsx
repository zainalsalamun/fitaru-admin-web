import { AdminPage } from "@/components/admin/admin-page";
import { CustomSelect } from "@/components/ui/custom-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminNotifications } from "@/lib/admin-repository";
import { notifications } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  createNotificationAction,
  deleteNotificationAction,
  updateNotificationAction,
} from "./actions";

export const dynamic = "force-dynamic";

async function getNotifications() {
  if (!hasSupabaseAdminEnv()) {
    return notifications;
  }

  try {
    return await getAdminNotifications();
  } catch {
    return notifications;
  }
}

type NotificationItem = Awaited<ReturnType<typeof getNotifications>>[number];
type EditableNotificationItem = NotificationItem & {
  id: string;
  message: string;
  scheduledAt: string;
  segmentValue: string;
  statusValue: string;
};

function isEditableNotificationItem(
  item: NotificationItem | undefined,
): item is EditableNotificationItem {
  return Boolean(item && "id" in item);
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

interface NotificationsPageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams;
  const items = await getNotifications();
  const candidateItem = params?.edit
    ? items.find((item) => "id" in item && item.id === params.edit)
    : undefined;
  const editedItem = isEditableNotificationItem(candidateItem) ? candidateItem : undefined;
  const isEditing = Boolean(editedItem);

  return (
    <AdminPage
      active="Notifications"
      action={<a className="primary-button" href="/notifications">+ Campaign</a>}
      description="Siapkan reminder dan broadcast untuk user Fitaru."
      title="Notifications"
    >
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Campaign Notifikasi</h2>
              <p>Untuk MVP, campaign disiapkan dulu sebelum integrasi FCM.</p>
            </div>
            <a href="#">Lihat segment</a>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Segment</th>
                  <th>Jadwal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={5}>
                      Belum ada campaign notifikasi.
                    </td>
                  </tr>
                ) : (
                  items.map((notification) => (
                    <tr key={notification.title}>
                      <td>{notification.title}</td>
                      <td className="muted">{notification.segment}</td>
                      <td className="muted">{notification.schedule}</td>
                      <td>
                        <StatusBadge>{notification.status}</StatusBadge>
                      </td>
                      <td>
                        {isEditableNotificationItem(notification) ? (
                          <div className="row-actions">
                            <a className="text-action" href={`/notifications?edit=${notification.id}`}>
                              Edit
                            </a>
                            <form action={deleteNotificationAction}>
                              <input name="id" type="hidden" value={notification.id} />
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
              <h2>{isEditing ? "Edit Campaign" : "Editor Campaign"}</h2>
              <p>
                {isEditing
                  ? "Update pesan, segment, jadwal, atau status campaign."
                  : "Buat draft campaign notifikasi untuk user Fitaru."}
              </p>
            </div>
          </div>

          <form
            action={isEditing ? updateNotificationAction : createNotificationAction}
            className="form-grid"
          >
            {editedItem && <input name="id" type="hidden" value={editedItem.id} />}
            <label>
              Judul
              <input
                defaultValue={editedItem?.title ?? ""}
                name="title"
                placeholder="Contoh: Jangan lupa catat makan siang"
                required
              />
            </label>
            <label>
              Segment
              <CustomSelect
                defaultValue={editedItem?.segmentValue ?? "all"}
                name="targetSegment"
                options={[
                  { label: "Semua user", value: "all" },
                  { label: "User aktif", value: "active" },
                  { label: "Tidak aktif 7 hari", value: "inactive_7_days" },
                  { label: "Goal turun berat badan", value: "lose_weight" },
                  { label: "Belum catat makan hari ini", value: "no_meal_today" },
                ]}
                required
              />
            </label>
            <label>
              Status
              <CustomSelect
                defaultValue={editedItem?.statusValue ?? "draft"}
                name="status"
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Scheduled", value: "scheduled" },
                  { label: "Sent", value: "sent" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
                required
              />
            </label>
            <label>
              Jadwal
              <input
                defaultValue={toDateTimeLocal(editedItem?.scheduledAt)}
                name="scheduledAt"
                type="datetime-local"
              />
            </label>
            <label>
              Pesan
              <textarea
                defaultValue={editedItem?.message ?? ""}
                name="message"
                placeholder="Tulis pesan pendek yang akan dikirim ke user..."
                required
                rows={5}
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                {isEditing ? "Update Campaign" : "Simpan Campaign"}
              </button>
              {isEditing && (
                <a className="secondary-button" href="/notifications">
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
