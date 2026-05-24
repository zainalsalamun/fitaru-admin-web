import { AdminPage } from "@/components/admin/admin-page";
import { settings } from "@/lib/cms-data";

export default function SettingsPage() {
  return (
    <AdminPage
      active="Settings"
      action={<button className="primary-button">Simpan Perubahan</button>}
      description="Konfigurasi default aplikasi Fitaru."
      title="Settings"
    >
      <section className="settings-grid">
        {settings.map((setting) => (
          <article className="setting-card" key={setting.label}>
            <div>
              <strong>{setting.label}</strong>
              <p>{setting.description}</p>
            </div>
            <span>{setting.value}</span>
          </article>
        ))}
      </section>
    </AdminPage>
  );
}
