import { v2 as cloudinary } from "cloudinary";
import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { getCloudinaryConfig, getMaxUploadBytes } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns a short-lived signature so the admin's browser can upload images
// directly to Cloudinary. This keeps large files from passing through the
// serverless function (Vercel caps request bodies at 4.5MB).
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const config = getCloudinaryConfig();
  if (!config) {
    return fail("Cloudinary is not configured.", 400);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { folder: config.folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.apiSecret,
  );

  return ok({
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder: config.folder,
    timestamp,
    signature,
    maxBytes: getMaxUploadBytes(),
  });
}
