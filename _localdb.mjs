// Temporary diagnostics: inspects the local development MongoDB.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1:27017/";
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const dbs = await db.admin().command({ listDatabases: 1, nameOnly: true });
  console.log("DATABASES ::", dbs.databases.map((d) => d.name).join(", "));
  for (const d of dbs.databases) {
    if (d.name === "admin" || d.name === "local" || d.name === "config") continue;
    const coll = mongoose.connection.useDb(d.name);
    const cols = await coll.db.listCollections().toArray();
    console.log(`DB ${d.name}:`);
    for (const c of cols) {
      const n = await coll.db.collection(c.name).countDocuments();
      console.log(`   ${c.name}: ${n}`);
      if (["admins", "photos", "messages", "settings"].includes(c.name)) {
        const sample = await coll.db.collection(c.name).find({}, { projection: { passwordHash: 0 } }).limit(3).toArray();
        console.log("     sample:", JSON.stringify(sample).slice(0, 800));
      }
    }
  }
  await mongoose.disconnect();
} catch (e) {
  console.log("FAIL ::", e.message);
  process.exit(1);
}
