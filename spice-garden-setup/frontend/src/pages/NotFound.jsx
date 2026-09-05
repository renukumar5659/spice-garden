import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container section-tight">
      <div className="empty-state">
        <div className="icon">🍂</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
