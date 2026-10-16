// Creates the initial administrator account in MongoDB.
// Usage: npm run init-admin
// Optional: ADMIN_USERNAME / ADMIN_PASSWORD env vars (or .env.local values)
// override the default clickmedia / clickmedia@12 credentials.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const USERNAME = (process.env.ADMIN_USERNAME || "clickmedia").trim();
const PASSWORD = process.env.ADMIN_PASSWORD || "clickmedia@12";
const MONGO_URI = (process.env.MONGODB_URI || "").trim();

const BCRYPT_ROUNDS = 12;

if (!MONGO_URI) {
  console.error(
    "[init-admin] MONGODB_URI is not set. Copy .env.example to .env.local and configure it.",
  );
  process.exit(1);
}

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);

try {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const Admin =
    mongoose.models.Admin ?? mongoose.model("Admin", AdminSchema);
  await Admin.init();

  const existing = await Admin.findOne({ username: USERNAME })
    .select("+passwordHash")
    .lean()
    .exec();

  if (existing) {
    const samePassword = await bcrypt.compare(PASSWORD, existing.passwordHash);
    if (samePassword) {
      console.log(
        `[init-admin] Administrator "${USERNAME}" already exists with the expected password. Nothing to do.`,
      );
    } else {
      console.log(
        `[init-admin] Administrator "${USERNAME}" already exists with a different password. ` +
          "Use the dashboard (Account → Change password) to update it, or set ADMIN_PASSWORD to match. " +
          "The existing account was left untouched.",
      );
    }
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  await Admin.create({ username: USERNAME, passwordHash });

  console.log(`[init-admin] Created administrator "${USERNAME}".`);
  console.log("[init-admin] Sign in at /admin/login.");
} catch (error) {
  console.error("[init-admin] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
