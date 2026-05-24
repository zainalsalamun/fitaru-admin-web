import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { notifications } from "@/lib/cms-data";

export default function NotificationsPage() {
  return (
    <AdminPage
      active="Notifications"
      action={<button className="primary-button">+ Campaign</button>}
      description="Siapkan reminder dan broadcast untuk user Fitaru."
      title="Notifications"
    >
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
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.title}>
                  <td>{notification.title}</td>
                  <td className="muted">{notification.segment}</td>
                  <td className="muted">{notification.schedule}</td>
                  <td>
                    <StatusBadge>{notification.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </AdminPage>
  );
}
