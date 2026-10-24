import mongoose from "mongoose";

// Reuse one connection across hot reloads (dev) and warm serverless invocations (prod).
const cache = ((globalThis as { _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } })._mongoose ??= {
  conn: null,
  promise: null,
});

export async function connectDb() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}
