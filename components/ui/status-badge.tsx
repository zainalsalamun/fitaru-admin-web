interface StatusBadgeProps {
  children: React.ReactNode;
}

export function StatusBadge({ children }: StatusBadgeProps) {
  const value = String(children).toLowerCase();
  const variant =
    value === "published" ||
    value === "reviewed" ||
    value === "active" ||
    value === "sent" ||
    value.includes("log")
      ? "success"
      : value === "draft" || value === "scheduled"
        ? "warning"
        : "danger";

  return <span className={`badge ${variant}`}>{children}</span>;
}
