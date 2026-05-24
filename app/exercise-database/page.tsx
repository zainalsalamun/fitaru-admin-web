import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminExerciseItems } from "@/lib/admin-repository";
import { exerciseItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

async function getExerciseItems() {
  if (!hasSupabaseAdminEnv()) {
    return exerciseItems;
  }

  try {
    return await getAdminExerciseItems();
  } catch {
    return exerciseItems;
  }
}

export default async function ExerciseDatabasePage() {
  const items = await getExerciseItems();

  return (
    <AdminPage
      active="Exercise Database"
      action={<button className="primary-button">+ Tambah Olahraga</button>}
      description="Kelola referensi olahraga dan estimasi kalori dasar."
      title="Exercise Database"
    >
      <article className="panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Olahraga</h2>
            <p>Dipakai user saat membuat catatan olahraga.</p>
          </div>
          <a href="#">Filter kategori</a>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Intensitas</th>
                <th>Durasi</th>
                <th>Kalori</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="muted" colSpan={6}>
                    Belum ada data olahraga.
                  </td>
                </tr>
              ) : (
                items.map((exercise) => (
                  <tr key={exercise.name}>
                    <td>{exercise.name}</td>
                    <td className="muted">{exercise.category}</td>
                    <td className="muted">{exercise.intensity}</td>
                    <td className="muted">{exercise.duration}</td>
                    <td className="muted">{exercise.calories}</td>
                    <td>
                      <StatusBadge>{exercise.status}</StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </AdminPage>
  );
}
