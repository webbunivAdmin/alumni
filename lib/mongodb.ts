import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://alumni:123@cluster0.qyka68l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable inside .env.local")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongo

if (!cached) {
  // @ts-ignore
  cached = global.mongo = { conn: null, promise: null }
}

interface MongoConnection {
  conn: {
    db: Db
    client: MongoClient
  } | null
  promise: Promise<{
    db: Db
    client: MongoClient
  }> | null
}

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      }
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
