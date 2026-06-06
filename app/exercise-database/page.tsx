import { AdminPage } from "@/components/admin/admin-page";
import { CustomSelect } from "@/components/ui/custom-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminExerciseItems } from "@/lib/admin-repository";
import { exerciseItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  createExerciseItemAction,
  deleteExerciseItemAction,
  updateExerciseItemAction,
} from "./actions";

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

type ExerciseItem = Awaited<ReturnType<typeof getExerciseItems>>[number];
type EditableExerciseItem = ExerciseItem & {
  caloriesValue: number | null;
  categoryValue: string;
  durationValue: number;
  id: string;
  intensityValue: string;
  notes: string;
  statusValue: string;
};

function isEditableExerciseItem(item: ExerciseItem | undefined): item is EditableExerciseItem {
  return Boolean(item && "id" in item);
}

interface ExerciseDatabasePageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function ExerciseDatabasePage({ searchParams }: ExerciseDatabasePageProps) {
  const params = await searchParams;
  const items = await getExerciseItems();
  const candidateItem = params?.edit
    ? items.find((item) => "id" in item && item.id === params.edit)
    : undefined;
  const editedItem = isEditableExerciseItem(candidateItem) ? candidateItem : undefined;
  const isEditing = Boolean(editedItem);

  return (
    <AdminPage
      active="Exercise Database"
      action={<a className="primary-button" href="/exercise-database">+ Tambah Olahraga</a>}
      description="Kelola referensi olahraga dan estimasi kalori dasar."
      title="Exercise Database"
    >
      <section className="content-grid">
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
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={7}>
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
                      <td>
                        {isEditableExerciseItem(exercise) ? (
                          <div className="row-actions">
                            <a className="text-action" href={`/exercise-database?edit=${exercise.id}`}>
                              Edit
                            </a>
                            <form action={deleteExerciseItemAction}>
                              <input name="id" type="hidden" value={exercise.id} />
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
              <h2>{isEditing ? "Edit Olahraga" : "Editor Olahraga"}</h2>
              <p>{isEditing ? "Update referensi olahraga." : "Tambah olahraga baru ke database."}</p>
            </div>
          </div>

          <form
            action={isEditing ? updateExerciseItemAction : createExerciseItemAction}
            className="form-grid"
          >
            {editedItem && <input name="id" type="hidden" value={editedItem.id} />}
            <label>
              Nama
              <input
                defaultValue={editedItem?.name ?? ""}
                name="name"
                placeholder="Contoh: Jalan kaki"
                required
              />
            </label>
            <label>
              Kategori
              <CustomSelect
                defaultValue={editedItem?.categoryValue ?? "walking"}
                name="category"
                options={[
                  { label: "Walking", value: "walking" },
                  { label: "Running", value: "running" },
                  { label: "Home workout", value: "home_workout" },
                  { label: "Cycling", value: "cycling" },
                  { label: "Yoga", value: "yoga" },
                  { label: "Gym", value: "gym" },
                  { label: "Lainnya", value: "other" },
                ]}
                required
              />
            </label>
            <label>
              Intensitas Default
              <CustomSelect
                defaultValue={editedItem?.intensityValue ?? "medium"}
                name="defaultIntensity"
                options={[
                  { label: "Ringan", value: "light" },
                  { label: "Sedang", value: "medium" },
                  { label: "Berat", value: "heavy" },
                ]}
                required
              />
            </label>
            <label>
              Status
              <CustomSelect
                defaultValue={editedItem?.statusValue ?? "active"}
                name="status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Durasi default
                <input
                  defaultValue={editedItem?.durationValue ?? 30}
                  min="1"
                  name="defaultDurationMinutes"
                  required
                  type="number"
                />
              </label>
              <label>
                Kalori / 30 menit
                <input
                  defaultValue={editedItem?.caloriesValue ?? ""}
                  min="0"
                  name="caloriesPer30Minutes"
                  type="number"
                />
              </label>
            </div>
            <label>
              Catatan
              <textarea
                defaultValue={editedItem?.notes ?? ""}
                name="notes"
                placeholder="Estimasi olahraga ringan untuk pemula..."
                rows={4}
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                {isEditing ? "Update Olahraga" : "Simpan Olahraga"}
              </button>
              {isEditing && (
                <a className="secondary-button" href="/exercise-database">
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
