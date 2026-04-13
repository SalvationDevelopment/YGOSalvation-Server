"use client";

import { useRouter } from "next/navigation";

/**
 * Renders the Logout Button component and returns the UI used by the logout button view.
 * @returns {React.ReactNode} Returns the rendered UI used by the logout button view.
 */
export default function LogoutButton() {
  const router = useRouter();

      /**
   * Handles logout events for the logout button module.
   * @returns {Promise<void>} Resolves when the logout button operation completes.
   */
  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="btn" onClick={onLogout}>
      Logout
    </button>
  );
}
