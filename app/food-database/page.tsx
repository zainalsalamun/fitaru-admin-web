import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { foodItems } from "@/lib/cms-data";

export default function FoodDatabasePage() {
  return (
    <AdminPage
      active="Food Database"
      action={<button className="primary-button">+ Tambah Makanan</button>}
      description="Kelola referensi makanan lokal untuk pencatatan user."
      title="Food Database"
    >
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
              </tr>
            </thead>
            <tbody>
              {foodItems.map((food) => (
                <tr key={food.name}>
                  <td>{food.name}</td>
                  <td className="muted">{food.category}</td>
                  <td className="muted">{food.portion}</td>
                  <td className="muted">{food.calories}</td>
                  <td>
                    <StatusBadge>{food.status}</StatusBadge>
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
