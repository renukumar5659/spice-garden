import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as authService from "../services/authService";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await authService.resetPassword(
        uid,
        token,
        password
      );

      setMessage(
        "Your password has been reset successfully. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to reset your password. The link may be invalid or expired."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section-tight auth-page">
      <form
        className="card auth-form"
        onSubmit={handleSubmit}
      >
        <h1>Reset Password</h1>

        <p className="auth-sub">
          Enter your new password below.
        </p>

        {message && (
          <div className="form-success-banner">
            {message}
          </div>
        )}

        {error && (
          <div className="form-error-banner">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="password">
            New Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter new password"
            minLength={8}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm new password"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting
            ? "Resetting..."
            : "Reset Password"}
        </button>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/login">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}