import { AdminPage } from "@/components/admin/admin-page";
import { CustomSelect } from "@/components/ui/custom-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminUsers } from "@/lib/admin-repository";
import { users } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { updateUserStatusAction } from "./actions";

export const dynamic = "force-dynamic";

async function getUsers() {
  if (!hasSupabaseAdminEnv()) {
    return users;
  }

  try {
    return await getAdminUsers();
  } catch {
    return users;
  }
}

type UserItem = Awaited<ReturnType<typeof getUsers>>[number];
type EditableUserItem = UserItem & {
  activityLevel: string;
  calorieTarget: number | null;
  currentWeightKg: number | null;
  dietStyle: string;
  exerciseWeeklyTarget: number | null;
  id: string;
  statusValue: string;
  targetWeightKg: number | null;
  waterGlassesTarget: number | null;
};

function isEditableUserItem(item: UserItem | undefined): item is EditableUserItem {
  return Boolean(item && "id" in item);
}

function formatValue(value: number | null, suffix = "") {
  if (value === null) {
    return "-";
  }

  return `${value}${suffix}`;
}

interface UsersPageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const items = await getUsers();
  const candidateUser = params?.edit
    ? items.find((item) => "id" in item && item.id === params.edit)
    : undefined;
  const editedUser = isEditableUserItem(candidateUser) ? candidateUser : undefined;

  return (
    <AdminPage
      active="Users"
      action={<button className="secondary-button">Export</button>}
      description="Pantau user, tujuan diet, status akun, dan aktivitas terakhir."
      title="Users"
    >
      <section className="content-grid">
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
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={6}>
                      Belum ada user mobile.
                    </td>
                  </tr>
                ) : (
                  items.map((user) => (
                    <tr key={user.contact}>
                      <td>{user.name}</td>
                      <td className="muted">{user.contact}</td>
                      <td className="muted">{user.goal}</td>
                      <td>
                        <StatusBadge>{user.status}</StatusBadge>
                      </td>
                      <td className="muted">{user.lastActive}</td>
                      <td>
                        {isEditableUserItem(user) ? (
                          <a className="text-action" href={`/users?edit=${user.id}`}>
                            Kelola
                          </a>
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
              <h2>User Detail</h2>
              <p>
                {editedUser
                  ? `Kelola akun ${editedUser.name}.`
                  : "Pilih user untuk melihat detail dan mengubah status akun."}
              </p>
            </div>
          </div>

          <div className="list">
            <div className="setting-card compact">
              <div>
                <strong>{editedUser?.name ?? "Belum ada user dipilih"}</strong>
                <p>{editedUser?.contact ?? "Detail user akan muncul di sini."}</p>
              </div>
              {editedUser && <StatusBadge>{editedUser.status}</StatusBadge>}
            </div>

            {editedUser && (
              <>
                <div className="detail-grid">
                  <div>
                    <span>Tujuan</span>
                    <strong>{editedUser.goal}</strong>
                  </div>
                  <div>
                    <span>Diet Style</span>
                    <strong>{editedUser.dietStyle}</strong>
                  </div>
                  <div>
                    <span>Aktivitas</span>
                    <strong>{editedUser.activityLevel}</strong>
                  </div>
                  <div>
                    <span>Berat</span>
                    <strong>{formatValue(editedUser.currentWeightKg, " kg")}</strong>
                  </div>
                  <div>
                    <span>Target Berat</span>
                    <strong>{formatValue(editedUser.targetWeightKg, " kg")}</strong>
                  </div>
                  <div>
                    <span>Target Kalori</span>
                    <strong>{formatValue(editedUser.calorieTarget, " kkal")}</strong>
                  </div>
                  <div>
                    <span>Target Air</span>
                    <strong>{formatValue(editedUser.waterGlassesTarget, " gelas")}</strong>
                  </div>
                  <div>
                    <span>Olahraga</span>
                    <strong>{formatValue(editedUser.exerciseWeeklyTarget, "x/minggu")}</strong>
                  </div>
                </div>

                <form action={updateUserStatusAction} className="form-grid inset">
                  <input name="id" type="hidden" value={editedUser.id} />
                  <label>
                    Status Akun
                    <CustomSelect
                      defaultValue={editedUser.statusValue}
                      name="status"
                      options={[
                        { label: "Active", value: "active" },
                        { label: "Suspended", value: "suspended" },
                        { label: "Deleted", value: "deleted" },
                      ]}
                      required
                    />
                  </label>
                  <div className="form-actions">
                    <button className="primary-button" type="submit">
                      Update Status
                    </button>
                    <a className="secondary-button" href="/users">
                      Batal
                    </a>
                  </div>
                </form>
              </>
            )}
          </div>
        </aside>
      </section>
    </AdminPage>
  );
}
