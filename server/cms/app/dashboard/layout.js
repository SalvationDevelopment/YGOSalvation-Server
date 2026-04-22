import Link from "next/link";
import { requireAdminPage } from "@/lib/server-auth";
import LogoutButton from "@/components/dashboard/logout-button";

/**
 * Renders the Dashboard Layout component and returns the UI used by the dashboard view.
 * @param {Object} props The props object supplies the structured input used by the dashboard module, including the `children` property.
 * @param {React.ReactNode} props.children The `children` property supplies structured input used by the dashboard module.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the dashboard view.
 */
export default async function DashboardLayout({ children }) {
  const session = await requireAdminPage();

  return (
    <main className="screen-wrap">
      <section className="dashboard-shell">
        <aside className="panel glass sidebar-nav">
          <h2>CMS</h2>
          <p className="muted">{session.username}</p>
          <nav>
            <Link href="/dashboard/users">Users</Link>
            <Link href="/dashboard/news">News</Link>
            <Link href="/dashboard/backgrounds">Backgrounds</Link>
            <Link href="/dashboard/covers">Covers</Link>
            <Link href="/dashboard/decks">Decks</Link>
            <Link href="/dashboard/tournaments">Tournaments</Link>
            <Link href="/dashboard/contact">Contact</Link>
          </nav>
          <LogoutButton />
        </aside>

        <div className="dashboard-main">{children}</div>
      </section>
    </main>
  );
}
