import { requireAdminPage } from "@/lib/server-auth";
import NewsManagementPage from "@/components/management/news-management-page";

/**
 * Renders the News Page component and returns the UI used by the news view.
 * @returns {Promise<React.ReactNode>} Resolves with the rendered UI used by the news view.
 */
export default async function NewsPage() {
  await requireAdminPage();
  return <NewsManagementPage />;
}
