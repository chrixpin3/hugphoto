// Starts a persistent local MongoDB for development using mongodb-memory-server.
// Data is stored in .data/mongodb so it survives restarts.
// Usage: npm run db
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.MONGO_PORT || 27017);
const DB_NAME = process.env.MONGO_DB_NAME || "hugphotos";
const dbPath = path.join(process.cwd(), ".data", "mongodb");

await mkdir(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: { port: PORT, dbName: DB_NAME, dbPath },
});

console.log(`[db] MongoDB ready at ${mongod.getUri()}`);
console.log("[db] Press Ctrl+C to stop.");

const shutdown = async () => {
  try {
    await mongod.stop();
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

setInterval(() => {}, 1 << 30);
