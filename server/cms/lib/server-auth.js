import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getSessionCookieName } from "@/lib/session";

/**
 * Gets server session used by the server auth module.
 * @returns {Promise<null>} Resolves with the value produced by the server auth module.
 */
export async function getServerSession() {
  const store = await cookies();
  const token = store.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Executes the require admin page helper used by the server auth module.
 * @returns {Promise<Object>} Resolves with the value produced by the server auth module.
 */
export async function requireAdminPage() {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return session;
}
