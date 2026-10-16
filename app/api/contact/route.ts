import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { createMessage } from "@/lib/messages";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    await createMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      service: parsed.data.service ?? "",
      preferredDate: parsed.data.preferredDate ?? "",
      message: parsed.data.message,
    });
    return ok({ success: true }, 201);
  } catch (error) {
    console.error("[api/contact] Failed to store message:", error);
    return fail("Unable to send your message right now.", 500);
  }
}
