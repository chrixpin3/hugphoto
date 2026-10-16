import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({
  instance: { port: 27099, dbName: "hugphotos" },
});

console.log("MONGO_URI=" + mongod.getUri());

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
