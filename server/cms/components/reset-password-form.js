"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Renders the Reset Password Form component and returns the UI used by the reset password form view.
 * @param {Object} props The props object supplies the structured input used by the reset password form module, including the `token` property.
 * @param {string} props.token The `token` property supplies structured input used by the reset password form module.
 * @returns {React.ReactNode} Returns the rendered UI used by the reset password form view.
 */
export default function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

      /**
   * Handles submit events for the reset password form module.
   * @param {Object} event The event event provides the browser event data used by the reset password form module.
   * @returns {Promise<void>} Resolves when the reset password form operation completes.
   */
  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, passwordConfirmation })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to reset password.");
      } else {
        setMessage("Password updated. You can now log in.");
      }
    } catch {
      setError("Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <section className="panel glass form-panel">
        <h1>Set New Password</h1>
        {!token ? <p className="error">Missing recovery token.</p> : null}

        <form onSubmit={onSubmit} className="form-stack">
          <label>
            New Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="success">{message}</p> : null}

          <button className="btn primary" type="submit" disabled={loading || !token}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="links-row">
          <Link href="/login">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
