import { requireAdminPage } from "@/lib/server-auth";
import DecksManagementPage from "@/components/management/decks-management-page";

/**
 * Renders the Decks Page component and returns the UI used by the decks view.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the decks view.
 */
export default async function DecksPage() {
  await requireAdminPage();
  return <DecksManagementPage />;
}
