import { AdminPage } from "@/components/admin/admin-page";
import { CustomSelect } from "@/components/ui/custom-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminAccounts } from "@/lib/admin-repository";
import { requireSuperAdmin } from "@/lib/auth/session";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  createAdminAccountAction,
  deleteAdminAccountAction,
  updateAdminAccountAction,
} from "./actions";

export const dynamic = "force-dynamic";

const mockAdminAccounts = [
  {
    createdAt: "-",
    email: "admin@fitaru.app",
    id: "mock-super-admin",
    lastLogin: "-",
    name: "Fitaru Admin",
    role: "Super Admin",
    roleValue: "super_admin",
    status: "Active",
    statusValue: "active",
  },
];

async function getAccounts() {
  if (!hasSupabaseAdminEnv()) {
    return mockAdminAccounts;
  }

  try {
    return await getAdminAccounts();
  } catch {
    return mockAdminAccounts;
  }
}

type AdminAccount = Awaited<ReturnType<typeof getAccounts>>[number];

interface AdminUsersPageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireSuperAdmin();

  const params = await searchParams;
  const accounts = await getAccounts();
  const editedAccount = params?.edit
    ? accounts.find((account) => account.id === params.edit)
    : undefined;
  const isEditing = Boolean(editedAccount);

  return (
    <AdminPage
      active="Admin Users"
      action={<a className="primary-button" href="/admin-users">+ Admin Baru</a>}
      description="Kelola akun admin dan role akses CMS Fitaru."
      title="Admin Users"
    >
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Admin Management</h2>
              <p>Super Admin punya akses penuh ke semua modul CMS.</p>
            </div>
            <a href="#">Super Admin only</a>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={6}>
                      Belum ada admin.
                    </td>
                  </tr>
                ) : (
                  accounts.map((account: AdminAccount) => (
                    <tr key={account.email}>
                      <td>{account.name}</td>
                      <td className="muted">{account.email}</td>
                      <td className="muted">{account.role}</td>
                      <td>
                        <StatusBadge>{account.status}</StatusBadge>
                      </td>
                      <td className="muted">{account.lastLogin}</td>
                      <td>
                        <div className="row-actions">
                          <a className="text-action" href={`/admin-users?edit=${account.id}`}>
                            Edit
                          </a>
                          <form action={deleteAdminAccountAction}>
                            <input name="id" type="hidden" value={account.id} />
                            <button className="danger-action" type="submit">
                              Hapus
                            </button>
                          </form>
                        </div>
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
              <h2>{isEditing ? "Edit Admin" : "Editor Admin"}</h2>
              <p>
                {isEditing
                  ? "Update role dan status admin."
                  : "Tambah akun admin untuk mengelola CMS Fitaru."}
              </p>
            </div>
          </div>

          <div className="list">
            <div className="setting-card compact">
              <div>
                <strong>Role Access</strong>
                <p>Super Admin: semua akses. Admin: operasional CMS tanpa kelola admin lain.</p>
              </div>
            </div>
          </div>

          <form
            action={isEditing ? updateAdminAccountAction : createAdminAccountAction}
            className="form-grid"
          >
            {editedAccount && <input name="id" type="hidden" value={editedAccount.id} />}
            <label>
              Nama
              <input
                defaultValue={editedAccount?.name ?? ""}
                name="name"
                placeholder="Contoh: Content Admin"
                required
              />
            </label>
            <label>
              Email
              <input
                defaultValue={editedAccount?.email ?? ""}
                name="email"
                placeholder="admin@fitaru.app"
                required
                type="email"
              />
            </label>
            <label>
              Role
              <CustomSelect
                defaultValue={editedAccount?.roleValue ?? "admin"}
                name="role"
                options={[
                  { label: "Super Admin", value: "super_admin" },
                  { label: "Admin", value: "admin" },
                ]}
                required
              />
            </label>
            <label>
              Status
              <CustomSelect
                defaultValue={editedAccount?.statusValue ?? "active"}
                name="status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                required
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                {isEditing ? "Update Admin" : "Simpan Admin"}
              </button>
              {isEditing && (
                <a className="secondary-button" href="/admin-users">
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
