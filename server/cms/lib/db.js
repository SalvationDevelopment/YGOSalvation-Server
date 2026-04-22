import mongoose from "mongoose";
import "@/lib/load-root-env";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to database used by the db module.
 * @returns {Promise<Object>} Resolves with the active Mongoose connection used by the db module.
 */
export async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!mongodbUri) {
    throw new Error(
      `Missing database URI environment variable (MONGODB_URI/MONGO_URI/DATABASE_URL). cwd=${process.cwd()}`,
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
