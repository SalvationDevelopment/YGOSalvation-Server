import { redirect } from "next/navigation";

/**
 * Executes the dashboard index page helper used by the dashboard module.
 * @returns {void} Does not return a value.
 */
export default function DashboardIndexPage() {
  redirect("/dashboard/users");
}
