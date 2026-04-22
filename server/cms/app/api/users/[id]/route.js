import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { isValidEmail, validatePasswordStrength } from "@/lib/validation";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles PATCH requests for the id route.
 * @param {Object} request The request request provides the incoming data used by the id route.
 * @param {Object} context The context object supplies the structured input used by the id module, including the `params` property.
 * @param {(Object|Promise<*>)} context.params The `params` property supplies structured input used by the id module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the id module.
 * @returns {Promise<Object>} Resolves with the response generated for the id route.
 */
export async function PATCH(request, { params }) {
  log(`PATCH /api/users/${params.id}`);
  const { id } = await params;
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates = {};

  if (body.username !== undefined) {
    const username = String(body.username || "").trim();
    if (!username) {
      return NextResponse.json({ success: false, error: "username cannot be empty." }, { status: 400 });
    }
    updates.username = username;
  }

  if (body.email !== undefined) {
    const email = String(body.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format." }, { status: 400 });
    }
    updates.email = email;
  }

  if (body.role !== undefined) {
    if (!["admin", "user"].includes(body.role)) {
      return NextResponse.json({ success: false, error: "role must be admin or user." }, { status: 400 });
    }
    updates.role = body.role;
  }

  if (body.points !== undefined) {
    const points = Number(body.points);
    if (!Number.isFinite(points) || points < 0) {
      return NextResponse.json({ success: false, error: "points must be a non-negative number." }, { status: 400 });
    }
    updates.points = points;
  }

  if (body.elo !== undefined) {
    const elo = Number(body.elo);
    if (!Number.isFinite(elo) || elo < 0) {
      return NextResponse.json({ success: false, error: "elo must be a non-negative number." }, { status: 400 });
    }
    updates.elo = elo;
  }

  if (body.service !== undefined) {
    updates.service = Boolean(body.service);
  }

  if (body.password) {
    const strength = validatePasswordStrength(body.password);
    if (!strength.ok) {
      return NextResponse.json({ success: false, error: "Password is too weak." }, { status: 400 });
    }
    updates.passwordHash = await hashPassword(body.password);
  }

  await connectToDatabase();

  try {
    const updated = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated._id.toString(),
        username: updated.username,
        email: updated.email,
        role: updated.role,
        points: updated.points ?? 0,
        elo: updated.elo ?? 1200,
        service: Boolean(updated.service),
        createdAt: updated.createdAt
      }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "Username or email already exists." }, { status: 409 });
    }
    throw error;
  }
}

/**
 * Handles DELETE requests for the id route.
 * @param {Object} request The request request provides the incoming data used by the id route.
 * @param {Object} context The context object supplies the structured input used by the id module, including the `params` property.
 * @param {(Object|Promise<*>)} context.params The `params` property supplies structured input used by the id module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the id module.
 * @returns {Promise<Object>} Resolves with the response generated for the id route.
 */
export async function DELETE(request, { params }) {
  log(`DELETE /api/users/${params.id}`);
  const { id } = await params;
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return NextResponse.json({ success: false, error: "Cannot delete the last admin user." }, { status: 400 });
    }
  }

  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
