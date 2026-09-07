export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  detail,
  tone = "green",
  children,
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-heading">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={18} />
        </span>
      </div>
      <div className="metric-value">
        {value}
        <span>{unit}</span>
        {children}
      </div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}
