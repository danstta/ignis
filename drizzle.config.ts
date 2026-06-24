import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js loads .env.local automatically, but drizzle-kit is a standalone CLI,
// so point dotenv at the same file the app uses.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
