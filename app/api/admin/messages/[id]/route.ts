import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { deleteMessageById, setMessageRead } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const { id } = await params;

  let payload: { read?: unknown } = {};
  try {
    payload = (await request.json()) as { read?: unknown };
  } catch {
    return fail("Invalid request body.", 400);
  }

  if (typeof payload.read !== "boolean") {
    return fail("Invalid request body.", 422);
  }

  try {
    const message = await setMessageRead(id, payload.read);
    if (!message) return fail("Message not found.", 404);
    return ok({ message });
  } catch (error) {
    console.error("[api/admin/messages/:id] Update failed:", error);
    return fail("Unable to update the message right now.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const { id } = await params;

  try {
    const deleted = await deleteMessageById(id);
    if (!deleted) return fail("Message not found.", 404);
    return ok({ success: true });
  } catch (error) {
    console.error("[api/admin/messages/:id] Delete failed:", error);
    return fail("Unable to delete the message right now.", 500);
  }
}
