import { AdminPage } from "@/components/admin/admin-page";
import { defaultAppSettings, getAppSettings } from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { updateSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  searchParams?: Promise<{
    saved?: string;
  }>;
}

async function getSettings() {
  if (!hasSupabaseAdminEnv()) {
    return defaultAppSettings;
  }

  try {
    return await getAppSettings();
  } catch {
    return defaultAppSettings;
  }
}

function SettingSummary({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <article className="setting-card">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <span>{value}</span>
    </article>
  );
}

function ToggleField({
  defaultChecked,
  description,
  label,
  name,
}: {
  defaultChecked: boolean;
  description: string;
  label: string;
  name: string;
}) {
  return (
    <label className="toggle-field">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
    </label>
  );
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const settings = await getSettings();

  return (
    <AdminPage
      active="Settings"
      action={<a className="primary-button" href="#settings-form">Edit Settings</a>}
      description="Konfigurasi default aplikasi Fitaru."
      title="Settings"
    >
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2>Ringkasan Settings</h2>
              <p>Konfigurasi ini dipakai sebagai default aplikasi mobile.</p>
            </div>
            <a href="#settings-form">Kelola</a>
          </div>

          {params?.saved === "1" && <p className="form-success settings-alert">Settings berhasil disimpan.</p>}

          <div className="settings-grid">
            <SettingSummary
              description="Brand yang tampil di aplikasi dan CMS."
              label="App profile"
              value={settings.appName}
            />
            <SettingSummary
              description="Target kalori awal untuk user baru."
              label="Kalori default"
              value={`${settings.defaultCalorieTarget} kkal / hari`}
            />
            <SettingSummary
              description="Target minum air awal untuk user baru."
              label="Target air"
              value={`${settings.defaultWaterGlassesTarget} gelas / hari`}
            />
            <SettingSummary
              description="Status maintenance aplikasi."
              label="Maintenance"
              value={settings.maintenanceEnabled ? "Aktif" : "Nonaktif"}
            />
          </div>
        </article>

        <aside className="panel form-panel" id="settings-form">
          <div className="panel-head">
            <div>
              <h2>Editor Settings</h2>
              <p>Ubah branding, target default, reminder, dan maintenance mode.</p>
            </div>
          </div>

          <form action={updateSettingsAction} className="form-grid">
            <fieldset className="form-section">
              <legend>App Profile</legend>
              <label>
                Nama aplikasi
                <input defaultValue={settings.appName} name="appName" required />
              </label>
              <label>
                Tagline
                <input defaultValue={settings.tagline} name="tagline" required />
              </label>
              <label>
                Support email
                <input defaultValue={settings.supportEmail} name="supportEmail" required type="email" />
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>Health Defaults</legend>
              <label>
                Target kalori default
                <input
                  defaultValue={settings.defaultCalorieTarget}
                  min={0}
                  name="defaultCalorieTarget"
                  required
                  type="number"
                />
              </label>
              <label>
                Target air default
                <input
                  defaultValue={settings.defaultWaterGlassesTarget}
                  min={0}
                  name="defaultWaterGlassesTarget"
                  required
                  type="number"
                />
              </label>
              <label>
                Target olahraga mingguan
                <input
                  defaultValue={settings.defaultExerciseWeeklyTarget}
                  min={0}
                  name="defaultExerciseWeeklyTarget"
                  required
                  type="number"
                />
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>Reminder</legend>
              <ToggleField
                defaultChecked={settings.reminderMealEnabled}
                description="Reminder untuk mencatat makan."
                label="Meal reminder"
                name="reminderMealEnabled"
              />
              <ToggleField
                defaultChecked={settings.reminderWaterEnabled}
                description="Reminder minum air harian."
                label="Water reminder"
                name="reminderWaterEnabled"
              />
              <ToggleField
                defaultChecked={settings.reminderExerciseEnabled}
                description="Reminder olahraga mingguan."
                label="Exercise reminder"
                name="reminderExerciseEnabled"
              />
            </fieldset>

            <fieldset className="form-section">
              <legend>Maintenance</legend>
              <ToggleField
                defaultChecked={settings.maintenanceEnabled}
                description="Aktifkan saat aplikasi perlu pengumuman maintenance."
                label="Maintenance mode"
                name="maintenanceEnabled"
              />
              <label>
                Pesan maintenance
                <textarea
                  defaultValue={settings.maintenanceMessage}
                  name="maintenanceMessage"
                  placeholder="Contoh: Fitaru sedang perawatan singkat malam ini."
                  rows={4}
                />
              </label>
            </fieldset>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                Simpan Settings
              </button>
            </div>
          </form>
        </aside>
      </section>
    </AdminPage>
  );
}
