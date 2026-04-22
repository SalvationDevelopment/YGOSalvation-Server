import Link from "next/link";

/**
 * Renders the Home Page component and returns the UI used by the app view.
 * @returns {React.ReactNode} Returns the rendered UI used by the app view.
 */
export default function HomePage() {
  return (
    <main className="screen-center">
      <section className="panel glass hero">
        <p>Admin tools for account management and recovery.</p>
        <div className="actions">
          <Link className="btn primary" href="/login">Admin Login</Link>
          <Link className="btn" href="/recover">Recover Password</Link>
        </div>
      </section>
    </main>
  );
}
