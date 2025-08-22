import { createRequire } from "module";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

export async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("Default admin already exists");
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const [admin] = await db.insert(users).values({
      username: "admin",
      email: "admin@parking.com",
      password: hashedPassword,
      role: "admin"
    }).returning();

    console.log("Default admin user created:", admin.email);
    console.log("Login with: admin@parking.com / admin123");
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}