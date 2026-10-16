// Temporary diagnostics: verifies MongoDB Atlas connectivity with MONGODB_URI.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

const uri = (process.env.MONGODB_URI || "").trim();
if (!uri) {
  console.log("RESULT :: FAIL :: MONGODB_URI is empty");
  process.exit(2);
}

const sanitized = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
console.log("URI ::", sanitized);

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  const admin = mongoose.connection.db.admin();
  const info = await admin.command({ ping: 1 });
  console.log("PING ::", JSON.stringify(info));
  const stats = await mongoose.connection.db.admin().command({ buildInfo: 1 });
  console.log("SERVER ::", stats.version);
  const dbName = mongoose.connection.name;
  console.log("DATABASE ::", dbName);
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log("COLLECTIONS ::", cols.map((c) => c.name).join(", ") || "(none)");
  for (const c of cols) {
    const n = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`  - ${c.name}: ${n} docs`);
  }
  console.log("RESULT :: PASS");
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.log("RESULT :: FAIL");
  console.log("ERROR NAME ::", error?.name);
  console.log("ERROR CODE ::", error?.code);
  console.log("ERROR MESSAGE ::", error?.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
}
