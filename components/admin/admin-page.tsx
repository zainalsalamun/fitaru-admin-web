import { Sidebar } from "@/components/admin/sidebar";

interface AdminPageProps {
  active: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  title: string;
}

export function AdminPage({
  active,
  action,
  children,
  description,
  title,
}: AdminPageProps) {
  return (
    <main className="admin-shell">
      <Sidebar active={active} />

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
            <div className="avatar">AD</div>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
