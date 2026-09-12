import { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      await authService.forgotPassword(email);

      setOtpSent(true);

      setMessage(
        "A 6-digit OTP has been sent to your email address."
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to send the OTP."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

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
        email,
        otp,
        password
      );

      setMessage(
        "Your password has been reset successfully. You can now log in."
      );

      setOtp("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to reset your password. Please check the OTP and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section-tight auth-page">
      <form
        className="card auth-form"
        onSubmit={
          otpSent
            ? handleResetPassword
            : handleSendOtp
        }
      >
        <h1>
          {otpSent
            ? "Reset Password"
            : "Forgot Password?"}
        </h1>

        <p className="auth-sub">
          {otpSent
            ? "Enter the OTP sent to your email and create a new password."
            : "Enter your registered email address and we will send you a 6-digit OTP."}
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
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            required
            disabled={otpSent}
          />
        </div>

        {!otpSent ? (
          <>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="otp">
                6-Digit OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="Enter OTP"
                required
              />
            </div>

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
          </>
        )}

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