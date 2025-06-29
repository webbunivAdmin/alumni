import { connectToDatabase } from "../lib/mongodb.js"
import bcrypt from "bcryptjs"

async function seedAdmin() {
  try {
    const { db } = await connectToDatabase()

    // Check if admin already exists
    const existingAdmin = await db.collection("admins").findOne({ identifier: "admin" })

    if (existingAdmin) {
      console.log("Admin already exists")
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Create admin user
    const admin = {
      identifier: "admin",
      password: hashedPassword,
      name: "System Administrator",
      email: "admin@bugemauniv.ac.ug",
      role: "super_admin",
      permissions: ["alumni_management", "voting_management", "user_management", "system_settings"],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("admins").insertOne(admin)

    console.log("Admin user created successfully")
    console.log("Identifier: admin")
    console.log("Password: admin123")
  } catch (error) {
    console.error("Error seeding admin:", error)
  }
}

seedAdmin()
