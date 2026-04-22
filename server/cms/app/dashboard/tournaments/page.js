import TournamentsManagementPage from "@/components/management/tournaments-management-page";

/**
 * Renders the Tournaments Page component and returns the UI used by the tournaments view.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the tournaments view.
 */
export default async function TournamentsPage() {
  return <TournamentsManagementPage />;
}
