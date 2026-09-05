import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.is_staff ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section-tight auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="auth-sub">Log in to track orders and check out faster.</p>
        {error && <div className="form-error-banner">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Logging in…" : "Login"}
        </button>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
