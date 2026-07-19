import { AdminAccountMenu } from "@/components/admin/admin-account-menu";
import { Sidebar } from "@/components/admin/sidebar";
import { logoutAction } from "@/app/logout/actions";
import { requireAdmin } from "@/lib/auth/session";

interface AdminPageProps {
  active: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  title: string;
}

export async function AdminPage({
  active,
  action,
  children,
  description,
  title,
}: AdminPageProps) {
  const admin = await requireAdmin(active);

  return (
    <main className="admin-shell">
      <Sidebar active={active} role={admin.role} />

      <section className="main-panel">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="top-actions">
            <label className="search-box">
              <span>⌕</span>
              <input placeholder="Cari data..." />
            </label>
            {action}
            <AdminAccountMenu
              email={admin.email}
              logoutAction={logoutAction}
              name={admin.name}
              role={admin.role}
            />
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
