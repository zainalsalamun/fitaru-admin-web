import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { users } from "@/lib/cms-data";

export default function UsersPage() {
  return (
    <AdminPage
      active="Users"
      action={<button className="secondary-button">Export</button>}
      description="Pantau user, tujuan diet, status akun, dan aktivitas terakhir."
      title="Users"
    >
      <article className="panel">
        <div className="panel-head">
          <div>
            <h2>User Management</h2>
            <p>Daftar user aplikasi Fitaru.</p>
          </div>
          <a href="#">Filter status</a>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kontak</th>
                <th>Tujuan</th>
                <th>Status</th>
                <th>Aktif terakhir</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.contact}>
                  <td>{user.name}</td>
                  <td className="muted">{user.contact}</td>
                  <td className="muted">{user.goal}</td>
                  <td>
                    <StatusBadge>{user.status}</StatusBadge>
                  </td>
                  <td className="muted">{user.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </AdminPage>
  );
}
