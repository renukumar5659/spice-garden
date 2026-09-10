import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as authService from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const googleButtonRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    let cancelled = false;

    function renderGoogleButton() {
      if (
        cancelled ||
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      ) {
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError("Google Sign-In is not configured.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        use_fedcm_for_button: true,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
          shape: "rectangular",
        }
      );
    }

    function loadGoogleScript() {
      if (window.google?.accounts?.id) {
        renderGoogleButton();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", renderGoogleButton);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = renderGoogleButton;

      document.head.appendChild(script);
    }

    loadGoogleScript();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGoogleCredential(response) {
    if (!response?.credential) {
      setError("Google Sign-In failed. Please try again.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const user = await authService.googleLogin(response.credential);

      navigate(user.is_staff ? "/admin" : from, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Google Sign-In failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const user = await login(email, password);

      navigate(user.is_staff ? "/admin" : from, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section-tight auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>

        <p className="auth-sub">
          Log in to track orders and check out faster.
        </p>

        {error && (
          <div className="form-error-banner">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? "Logging in…" : "Login"}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#ddd",
            }}
          />

          <span
            style={{
              color: "#777",
              fontSize: "14px",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#ddd",
            }}
          />
        </div>

        <div
          ref={googleButtonRef}
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "44px",
          }}
        />

        <p className="auth-switch">
          New here?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}