const navigation = [
  { label: "Overview", icon: "⌂", href: "/" },
  { label: "Users", icon: "◎", href: "/users" },
  { label: "Content", icon: "✎", href: "/content" },
  { label: "Food Database", icon: "◍", href: "/food-database" },
  { label: "Exercise Database", icon: "⌁", href: "/exercise-database" },
  { label: "Notifications", icon: "◷", href: "/notifications" },
  { label: "Feedback", icon: "☰", href: "/feedback" },
  { label: "Settings", icon: "⚙", href: "/settings" },
];

interface SidebarProps {
  active?: string;
}

export function Sidebar({ active = "Overview" }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a className="brand" href="/">
        <img className="logo-image" src="/assets/fitaru-mark.svg" alt="Fitaru" />
        <span>
          <strong>Fitaru</strong>
          <small>Admin CMS</small>
        </span>
      </a>

      <nav className="nav" aria-label="Admin navigation">
        {navigation.map((item) => (
          <a
            className={item.label === active ? "nav-item active" : "nav-item"}
            href={item.href}
            key={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-note">
        Fitaru CMS mengelola konten, database referensi, dan aktivitas aplikasi.
      </div>
    </aside>
  );
}
