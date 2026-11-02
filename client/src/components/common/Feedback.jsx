import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";

export function Loader({ label = "Loading", full = false }) {
  return (
    <div className={`loader ${full ? "loader-full" : ""}`} role="status">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="feedback-card error-card">
      <AlertCircle size={22} />
      <div>
        <strong>We couldn’t load this information</strong>
        <p>{message || "Please try again."}</p>
        {onRetry && (
          <button
            className="button button-secondary button-small"
            onClick={onRetry}
          >
            <RefreshCw size={15} /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Inbox size={22} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
