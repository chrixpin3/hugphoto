// Creates the initial administrator account in MongoDB (one-time bootstrap).
// Usage: npm run init-admin
// Credentials come only from server-side env vars (.env.local or the shell):
//   ADMIN_INITIAL_USERNAME / ADMIN_INITIAL_PASSWORD
//   (ADMIN_USERNAME / ADMIN_PASSWORD are accepted as legacy aliases)
// The script never overwrites an existing administrator.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const USERNAME = (
  process.env.ADMIN_INITIAL_USERNAME ||
  process.env.ADMIN_USERNAME ||
  ""
).trim();
const PASSWORD =
  process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || "";
const MONGO_URI = (process.env.MONGODB_URI || "").trim();

const BCRYPT_ROUNDS = 12;

if (!MONGO_URI) {
  console.error(
    "[init-admin] MONGODB_URI is not set. Copy .env.example to .env.local and configure it.",
  );
  process.exit(1);
}

if (!USERNAME || !PASSWORD) {
  console.error(
    "[init-admin] Set ADMIN_INITIAL_USERNAME and ADMIN_INITIAL_PASSWORD (server-side env vars) " +
      "before running this script. No default password is built in — never commit real credentials.",
  );
  process.exit(1);
}

if (USERNAME.length < 3 || PASSWORD.length < 8) {
  console.error(
    "[init-admin] Username must be 3+ characters and password must be 8+ characters.",
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
  console.log("[init-admin] Connected to MongoDB:", mongoose.connection.name);

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
          "Use the dashboard (Settings → Change password) to update it, or set ADMIN_INITIAL_PASSWORD to match. " +
          "The existing account was left untouched.",
      );
    }
    process.exit(0);
  }

  const others = await Admin.estimatedDocumentCount();
  if (others > 0 && !process.argv.includes("--allow-multiple")) {
    console.log(
      `[init-admin] ${others} administrator account(s) already exist and "${USERNAME}" is not among them. ` +
        "Refusing to add another administrator. Re-run with --allow-multiple if this is intentional.",
    );
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
