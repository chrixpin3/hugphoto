import type { NextRequest } from "next/server";
import { fail, ok, parsePositiveInt } from "@/lib/http";
import { listFeaturedPhotos, listPublishedPhotos } from "@/lib/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    if (searchParams.get("featured") === "true") {
      const limit = parsePositiveInt(searchParams.get("limit"), 6, 24);
      const items = await listFeaturedPhotos(limit);
      return ok({ items });
    }

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = parsePositiveInt(searchParams.get("pageSize"), 24, 60);
    const category = searchParams.get("category")?.trim() || undefined;

    const data = await listPublishedPhotos({ page, pageSize, category });
    return ok(data);
  } catch (error) {
    console.error("[api/photos] Failed to load gallery:", error);
    return fail("Unable to load photographs right now.", 500);
  }
}
