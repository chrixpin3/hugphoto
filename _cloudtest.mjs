// Temporary diagnostics: verifies Cloudinary credentials with a signed API call.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { v2: cloudinary } = require("cloudinary");

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.log("RESULT :: FAIL :: missing CLOUDINARY_* env vars");
  process.exit(2);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

try {
  const res = await cloudinary.api.ping();
  console.log("PING ::", JSON.stringify(res));
  let resources = null;
  try {
    resources = await cloudinary.api.resources({ max_results: 5, type: "upload" });
    console.log("RESOURCES :: total_count=" + resources.total_count);
    console.log("SAMPLE ::", JSON.stringify((resources.resources || []).map((r) => r.public_id)));
  } catch (e) {
    console.log("RESOURCES :: ERROR", e?.http_code, e?.message);
  }
  console.log("RESULT :: PASS");
  process.exit(0);
} catch (error) {
  console.log("RESULT :: FAIL");
  console.log("HTTP_CODE ::", error?.http_code);
  console.log("ERROR ::", error?.message);
  process.exit(1);
}
