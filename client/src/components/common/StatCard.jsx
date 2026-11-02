export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}) {
  return (
    <article className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? "—"}</div>
        {detail && <div className="stat-detail">{detail}</div>}
      </div>
      <span className={`stat-icon stat-${tone}`}>
        <Icon size={19} />
      </span>
    </article>
  );
}
