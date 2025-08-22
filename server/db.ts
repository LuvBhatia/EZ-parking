import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("⚠️  DATABASE_URL is not set!");
  console.error("📝 Please create a .env file with your database connection string");
  console.error("🔗 Example: DATABASE_URL=postgresql://username:password@host:port/database");
  console.error("💡 For development, you can use Neon (neon.tech) or any PostgreSQL database");
  
  // For development, provide a mock database or exit gracefully
  if (process.env.NODE_ENV === 'development') {
    console.error("🚫 Server cannot start without a database connection");
    console.error("💡 Please set up a database and add DATABASE_URL to your .env file");
    process.exit(1);
  }
}

// Create database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// Test the connection
pool.query('SELECT 1').then(() => {
  console.log("✅ Database connection successful");
}).catch((error) => {
  console.error("❌ Database connection failed:", error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error("💡 Please check your DATABASE_URL and ensure the database is running");
    process.exit(1);
  }
});

export { pool };
export const db = drizzle({ client: pool, schema });