export default function ErrorAlert({ message, onDismiss }) {
  return (
    <div className="alert alert-error" role="alert">
      <span className="alert-icon" aria-hidden="true">
        !
      </span>
      <div style={{ flex: 1 }}>
        <strong>Request failed.</strong> {message}
      </div>
      {onDismiss && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
