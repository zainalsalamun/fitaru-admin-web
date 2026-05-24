interface StatCardProps {
  icon: string;
  label: string;
  note: string;
  value: string;
}

export function StatCard({ icon, label, note, value }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-head">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
