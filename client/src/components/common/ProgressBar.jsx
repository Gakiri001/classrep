export default function ProgressBar({ value = 0, label, caption }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className="progress-block"><div className="progress-heading"><strong>{label}</strong><span>{caption ?? `${safeValue}%`}</span></div><div className="progress-track" role="progressbar" aria-valuenow={safeValue} aria-valuemin="0" aria-valuemax="100"><div className="progress-fill" style={{ width: `${safeValue}%` }} /></div></div>;
}
