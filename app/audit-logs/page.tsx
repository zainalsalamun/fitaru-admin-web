import { AdminPage } from "@/components/admin/admin-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminAuditLogs } from "@/lib/admin-repository";
import { requireSuperAdmin } from "@/lib/auth/session";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const mockAuditLogs = [
  {
    action: "Update",
    actionValue: "update",
    admin: "Super Admin",
    createdAt: "-",
    id: "mock-audit-log",
    metadata: { note: "Audit log akan tampil setelah Supabase siap." },
    resourceId: "-",
    resourceType: "Settings",
    resourceTypeValue: "settings",
  },
];

async function getLogs() {
  if (!hasSupabaseAdminEnv()) {
    return mockAuditLogs;
  }

  try {
    return await getAdminAuditLogs();
  } catch {
    return mockAuditLogs;
  }
}

function formatMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== "");

  if (entries.length === 0) {
    return "-";
  }

  return entries
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export default async function AuditLogsPage() {
  await requireSuperAdmin();
  const logs = await getLogs();

  return (
    <AdminPage
      active="Audit Logs"
      description="Riwayat aktivitas penting admin di CMS Fitaru."
      title="Audit Logs"
    >
      <article className="panel">
        <div className="panel-head">
          <div>
            <h2>Aktivitas Admin</h2>
            <p>Menampilkan 100 aktivitas terbaru yang tercatat dari server action CMS.</p>
          </div>
          <a href="#">Super Admin only</a>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Resource ID</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="muted" colSpan={6}>
                    Belum ada audit log.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="muted">{log.createdAt}</td>
                    <td>{log.admin}</td>
                    <td>
                      <StatusBadge>{log.action}</StatusBadge>
                    </td>
                    <td>{log.resourceType}</td>
                    <td className="muted">{log.resourceId}</td>
                    <td className="muted">{formatMetadata(log.metadata)}</td>
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
