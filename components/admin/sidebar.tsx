import Image from "next/image";
import Link from "next/link";
import { AdminRole, canAccess } from "@/lib/auth/permissions";

const navigation = [
  { label: "Overview", icon: "⌂", href: "/" },
  { label: "Users", icon: "◎", href: "/users" },
  { label: "Content", icon: "✎", href: "/content" },
  { label: "Food Database", icon: "◍", href: "/food-database" },
  { label: "Exercise Database", icon: "⌁", href: "/exercise-database" },
  { label: "Notifications", icon: "◷", href: "/notifications" },
  { label: "Feedback", icon: "☰", href: "/feedback" },
  { label: "Admin Users", icon: "◇", href: "/admin-users" },
  { label: "Audit Logs", icon: "◫", href: "/audit-logs" },
  { label: "Settings", icon: "⚙", href: "/settings" },
];

interface SidebarProps {
  active?: string;
  role: AdminRole;
}

export function Sidebar({ active = "Overview", role }: SidebarProps) {
  const visibleNavigation = navigation.filter((item) => canAccess(role, item.label));

  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <Image className="logo-image" src="/assets/fitaru-mark.svg" alt="Fitaru" width={42} height={42} />
        <span>
          <strong>Fitaru</strong>
          <small>Admin CMS</small>
        </span>
      </Link>

      <nav className="nav" aria-label="Admin navigation">
        {visibleNavigation.map((item) => (
          <Link
            className={item.label === active ? "nav-item active" : "nav-item"}
            href={item.href}
            key={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-note">
        Fitaru CMS mengelola konten, database referensi, dan aktivitas aplikasi.
      </div>
    </aside>
  );
}
