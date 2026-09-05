export default function EmptyState({ icon = "🍽️", title, message, action }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
