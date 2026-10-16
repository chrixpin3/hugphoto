// Verifies the MongoDB connection configured through MONGODB_URI and prints a
// safe summary (no credentials, no password hashes). Usage: npm run check-db
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

function readEnvFile(path) {
  try {
    const fs = require("node:fs");
    const content = fs.readFileSync(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    /* no env file — rely on process env */
  }
}

readEnvFile(".env.local");

const rawUri = (process.env.MONGODB_URI || "").trim();
if (!rawUri) {
  console.error("FAIL :: MONGODB_URI is not set.");
  process.exit(1);
}

const sanitized = rawUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
console.log("URI ::", sanitized);

try {
  await mongoose.connect(rawUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  const { version } = await mongoose.connection.db.admin().command({ buildInfo: 1 });
  console.log("SERVER :: MongoDB", version);
  console.log("DATABASE ::", mongoose.connection.name);

  const collections = await mongoose.connection.db.listCollections().toArray();
  if (collections.length === 0) console.log("COLLECTIONS :: (none yet)");
  for (const collection of collections) {
    const count = await mongoose.connection.db
      .collection(collection.name)
      .countDocuments();
    console.log(`  - ${collection.name}: ${count} document(s)`);
  }

  if (collections.some((c) => c.name === "admins")) {
    const admins = await mongoose.connection.db
      .collection("admins")
      .find({}, { projection: { username: 1 } })
      .toArray();
    console.log(
      "ADMINS ::",
      admins.map((a) => a.username).join(", ") || "(none)",
    );
  } else {
    console.log("ADMINS :: (no admins collection yet — run `npm run init-admin`)");
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  console.log(
    "CLOUDINARY ::",
    CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
      ? `configured (cloud "${CLOUDINARY_CLOUD_NAME}")`
      : "not configured — uploads fall back to local /public/uploads",
  );

  console.log("RESULT :: PASS — database connection works.");
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.log("RESULT :: FAIL");
  console.log("ERROR ::", error?.name, error?.code ?? "", error?.message);
  if (String(error?.message).includes("bad auth")) {
    console.log(
      "HINT :: The database user or password is wrong (or the user lacks access to this cluster). " +
        "Reset the password in MongoDB Atlas → Database Access, then update MONGODB_URI.",
    );
  }
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
}
