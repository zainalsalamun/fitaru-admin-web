import { AdminPage } from "@/components/admin/admin-page";
import { CustomSelect } from "@/components/ui/custom-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminFoodItems } from "@/lib/admin-repository";
import { foodItems } from "@/lib/cms-data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  createFoodItemAction,
  deleteFoodItemAction,
  updateFoodItemAction,
} from "./actions";

export const dynamic = "force-dynamic";

async function getFoodItems() {
  if (!hasSupabaseAdminEnv()) {
    return foodItems;
  }

  try {
    return await getAdminFoodItems();
  } catch {
    return foodItems;
  }
}

type FoodItem = Awaited<ReturnType<typeof getFoodItems>>[number];
type EditableFoodItem = FoodItem & {
  caloriesValue: number | null;
  carbsG: number | null;
  categoryValue: string;
  fatG: number | null;
  id: string;
  notes: string;
  portionValue: string;
  proteinG: number | null;
  statusValue: string;
};

function isEditableFoodItem(item: FoodItem | undefined): item is EditableFoodItem {
  return Boolean(item && "id" in item);
}

interface FoodDatabasePageProps {
  searchParams?: Promise<{
    edit?: string;
  }>;
}

export default async function FoodDatabasePage({ searchParams }: FoodDatabasePageProps) {
  const params = await searchParams;
  const items = await getFoodItems();
  const candidateItem = params?.edit
    ? items.find((item) => "id" in item && item.id === params.edit)
    : undefined;
  const editedItem = isEditableFoodItem(candidateItem) ? candidateItem : undefined;
  const isEditing = Boolean(editedItem);

  return (
    <AdminPage
      active="Food Database"
      action={<a className="primary-button" href="/food-database">+ Tambah Makanan</a>}
      description="Kelola referensi makanan lokal untuk pencatatan user."
      title="Food Database"
    >
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Daftar Makanan</h2>
              <p>Estimasi kalori tetap sederhana untuk MVP.</p>
            </div>
            <a href="#">Import CSV</a>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Porsi</th>
                  <th>Kalori</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={6}>
                      Belum ada data makanan.
                    </td>
                  </tr>
                ) : (
                  items.map((food) => (
                    <tr key={food.name}>
                      <td>{food.name}</td>
                      <td className="muted">{food.category}</td>
                      <td className="muted">{food.portion}</td>
                      <td className="muted">{food.calories}</td>
                      <td>
                        <StatusBadge>{food.status}</StatusBadge>
                      </td>
                      <td>
                        {isEditableFoodItem(food) ? (
                          <div className="row-actions">
                            <a className="text-action" href={`/food-database?edit=${food.id}`}>
                              Edit
                            </a>
                            <form action={deleteFoodItemAction}>
                              <input name="id" type="hidden" value={food.id} />
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
              <h2>{isEditing ? "Edit Makanan" : "Editor Makanan"}</h2>
              <p>{isEditing ? "Update referensi makanan." : "Tambah makanan baru ke database."}</p>
            </div>
          </div>

          <form action={isEditing ? updateFoodItemAction : createFoodItemAction} className="form-grid">
            {editedItem && <input name="id" type="hidden" value={editedItem.id} />}
            <label>
              Nama
              <input
                defaultValue={editedItem?.name ?? ""}
                name="name"
                placeholder="Contoh: Nasi ayam"
                required
              />
            </label>
            <label>
              Kategori
              <CustomSelect
                defaultValue={editedItem?.categoryValue ?? "homemade"}
                name="category"
                options={[
                  { label: "Makanan rumahan", value: "homemade" },
                  { label: "Makanan luar", value: "outside_food" },
                  { label: "Minuman", value: "drink" },
                  { label: "Buah", value: "fruit" },
                  { label: "Snack", value: "snack" },
                  { label: "Lainnya", value: "other" },
                ]}
                required
              />
            </label>
            <label>
              Porsi Default
              <CustomSelect
                defaultValue={editedItem?.portionValue ?? "medium"}
                name="defaultPortion"
                options={[
                  { label: "Kecil", value: "small" },
                  { label: "Sedang", value: "medium" },
                  { label: "Besar", value: "large" },
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
            <label>
              Kalori per porsi
              <input
                defaultValue={editedItem?.caloriesValue ?? ""}
                min="0"
                name="caloriesPerPortion"
                placeholder="520"
                type="number"
              />
            </label>
            <div className="form-row">
              <label>
                Protein
                <input defaultValue={editedItem?.proteinG ?? ""} min="0" name="proteinG" step="0.1" type="number" />
              </label>
              <label>
                Karbo
                <input defaultValue={editedItem?.carbsG ?? ""} min="0" name="carbsG" step="0.1" type="number" />
              </label>
              <label>
                Lemak
                <input defaultValue={editedItem?.fatG ?? ""} min="0" name="fatG" step="0.1" type="number" />
              </label>
            </div>
            <label>
              Catatan
              <textarea
                defaultValue={editedItem?.notes ?? ""}
                name="notes"
                placeholder="Estimasi porsi rumahan..."
                rows={4}
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                {isEditing ? "Update Makanan" : "Simpan Makanan"}
              </button>
              {isEditing && (
                <a className="secondary-button" href="/food-database">
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
