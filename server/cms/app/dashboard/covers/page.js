import { requireAdminPage } from "@/lib/server-auth";
import CoversManagementPage from "@/components/management/covers-management-page";

/**
 * Renders the Covers Page component and returns the UI used by the covers view.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the covers view.
 */
export default async function CoversPage() {
  await requireAdminPage();
  return <CoversManagementPage />;
}
