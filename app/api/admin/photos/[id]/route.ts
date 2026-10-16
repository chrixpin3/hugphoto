import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { deletePhotoById, updatePhoto } from "@/lib/photos";
import { deleteImage } from "@/lib/storage";
import { photoUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = photoUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    const photo = await updatePhoto(id, parsed.data);
    if (!photo) return fail("Photograph not found.", 404);
    return ok({ photo });
  } catch (error) {
    console.error("[api/admin/photos/:id] Update failed:", error);
    return fail("Unable to update the photograph right now.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const { id } = await params;

  try {
    const deleted = await deletePhotoById(id);
    if (!deleted) return fail("Photograph not found.", 404);

    await deleteImage(deleted.publicId ?? null, deleted.url).catch(() => undefined);

    return ok({ success: true });
  } catch (error) {
    console.error("[api/admin/photos/:id] Delete failed:", error);
    return fail("Unable to delete the photograph right now.", 500);
  }
}
