import { requireAdminPage } from "@/lib/server-auth";
import UsersManagementPage from "@/components/management/users-management-page";

/**
 * Renders the Users Page component and returns the UI used by the users view.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the users view.
 */
export default async function UsersPage() {
  await requireAdminPage();
  return <UsersManagementPage />;
}
