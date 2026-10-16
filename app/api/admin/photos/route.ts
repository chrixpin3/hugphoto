import type { NextRequest } from "next/server";
import { fail, ok, parsePositiveInt } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { countPhotos, createPhoto, listAllPhotos } from "@/lib/photos";
import { ALLOWED_MIME_TYPES, storeImage } from "@/lib/storage";
import { getMaxUploadBytes } from "@/lib/env";
import { photoCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readField(form: FormData, key: string, maxLength: number): string {
  const value = form.get(key);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = parsePositiveInt(searchParams.get("pageSize"), 24, 60);

    const [photos, stats] = await Promise.all([
      listAllPhotos({ page, pageSize }),
      countPhotos(),
    ]);

    return ok({ photos, stats });
  } catch (error) {
    console.error("[api/admin/photos] Failed to load photographs:", error);
    return fail("Unable to load photographs right now.", 500);
  }
}

// Persists a photo whose image was already uploaded directly to Cloudinary from
// the browser (keeps large files under the serverless request-body limit).
async function createFromDirectUpload(
  request: NextRequest,
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = photoCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    const photo = await createPhoto({
      url: parsed.data.url,
      publicId: parsed.data.publicId ?? null,
      width: parsed.data.width,
      height: parsed.data.height,
      title: parsed.data.title,
      category: parsed.data.category,
      featured: parsed.data.featured,
    });
    return ok({ photo, provider: "cloudinary" }, 201);
  } catch (error) {
    console.error("[api/admin/photos] Failed to save direct upload:", error);
    return fail("Upload failed. Please try again.", 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return createFromDirectUpload(request);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Invalid upload request.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("No image file was provided.", 400);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return fail(
      "Unsupported file type. Upload a JPEG, PNG, WebP, AVIF or GIF image.",
      415,
    );
  }

  const maxBytes = getMaxUploadBytes();
  if (file.size > maxBytes) {
    return fail(
      `Image is too large. The maximum size is ${Math.round(maxBytes / (1024 * 1024))}MB.`,
      413,
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeImage(buffer, file.type);

    const photo = await createPhoto({
      title: readField(form, "title", 140),
      category: readField(form, "category", 60),
      featured: form.get("featured") === "true",
      url: stored.url,
      publicId: stored.publicId,
      width: stored.width,
      height: stored.height,
    });

    return ok(
      { photo, provider: stored.provider },
      201,
    );
  } catch (error) {
    console.error("[api/admin/photos] Upload failed:", error);
    return fail("Upload failed. Please try again.", 500);
  }
}
