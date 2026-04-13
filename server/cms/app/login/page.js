"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Renders the Login Page component and returns the UI used by the login view.
 * @returns {React.ReactNode} Returns the rendered UI used by the login view.
 */
export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

      /**
   * Handles submit events for the login module.
   * @param {Object} event The event event provides the browser event data used by the login module.
   * @returns {Promise<void>} Resolves when the login operation completes.
   */
  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unexpected error while logging in.");
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <section className="panel glass form-panel">
        <h1>Admin Login</h1>
        <p>Use your admin username or email.</p>
        <form onSubmit={onSubmit} className="form-stack">
          <label>
            Identifier
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@ygo.local or admin"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="links-row">
          <Link href="/recover">Forgot password?</Link>
          <Link href="/">Home</Link>
        </div>
      </section>
    </main>
  );
}
