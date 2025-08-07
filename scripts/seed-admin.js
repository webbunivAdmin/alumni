// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection config
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}
if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable inside .env.local");
}

// Connection caching
let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function seedAdmin() {
  try {
    const { db } = await connectToDatabase();

    const existingAdmin = await db.collection("admins").findOne({ identifier: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = {
      identifier: "admin",
      password: hashedPassword,
      name: "System Administrator",
      email: "alumni@bugemauniv.ac.ug",
      role: "super_admin",
      permissions: [
        "alumni_management",
        "voting_management",
        "user_management",
        "system_settings",
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("admins").insertOne(admin);

    console.log("✅ Admin user created successfully");
    console.log("Identifier: admin");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
}

seedAdmin();
