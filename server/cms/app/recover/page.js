"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Renders the Recover Page component and returns the UI used by the recover view.
 * @returns {React.ReactNode} Returns the rendered UI used by the recover view.
 */
export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

      /**
   * Handles submit events for the recover module.
   * @param {Object} event The event event provides the browser event data used by the recover module.
   * @returns {Promise<void>} Resolves when the recover operation completes.
   */
  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to start recovery.");
      } else {
        setMessage(data.message || "Recovery started.");
        if (data.recovery?.resetUrl) {
          setResetUrl(data.recovery.resetUrl);
        }
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
        <h1>Recover Password</h1>
        <p>Enter your account email to generate a recovery link.</p>

        <form onSubmit={onSubmit} className="form-stack">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="success">{message}</p> : null}

          {resetUrl ? (
            <p className="muted small">
              Dev mode recovery link: <a href={resetUrl}>{resetUrl}</a>
            </p>
          ) : null}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Send Recovery"}
          </button>
        </form>

        <div className="links-row">
          <Link href="/login">Back to login</Link>
          <Link href="/">Home</Link>
        </div>
      </section>
    </main>
  );
}
