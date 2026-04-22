import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import "@/lib/load-root-env";

let bootstrapped = false;

/**
 * Executes the ensure admin user helper used by the bootstrap module.
 * @returns {Promise<void>} Resolves when the bootstrap operation completes.
 */
export async function ensureAdminUser() {
  if (bootstrapped) {
    return;
  }

  await connectToDatabase();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminUsername || !adminPassword) {
    bootstrapped = true;
    return;
  }

  const existingAdmin = await User.findOne({
    $or: [{ role: "admin" }, { email: adminEmail }, { username: adminUsername }]
  });
  if (existingAdmin) {
    existingAdmin.username = adminUsername;
    existingAdmin.email = adminEmail;
    existingAdmin.passwordHash = await hashPassword(adminPassword);
    existingAdmin.role = "admin";
    await existingAdmin.save();
    bootstrapped = true;
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await User.create({
    username: adminUsername,
    email: adminEmail,
    passwordHash,
    role: "admin"
  });

  bootstrapped = true;
}
