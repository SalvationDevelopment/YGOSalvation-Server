import { requireAdminPage } from "@/lib/server-auth";
import BackgroundsManagementPage from "@/components/management/backgrounds-management-page";

/**
 * Renders the Backgrounds Page component and returns the UI used by the backgrounds view.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the backgrounds view.
 */
export default async function BackgroundsPage() {
  await requireAdminPage();
  return <BackgroundsManagementPage />;
}
