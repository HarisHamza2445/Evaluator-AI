import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

let databaseUrl = process.env.DATABASE_URL;

// Workaround for SQLite read-only database issue on Serverless / Vercel platforms
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  const originalDbPath = path.join(process.cwd(), "prisma", "dev.db");
  const targetDbPath = "/tmp/dev.db";

  try {
    // If database does not exist in the writable /tmp directory, copy the seeded repository DB
    if (!fs.existsSync(targetDbPath)) {
      // Ensure target directory exists
      const targetDir = path.dirname(targetDbPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      if (fs.existsSync(originalDbPath)) {
        fs.copyFileSync(originalDbPath, targetDbPath);
        fs.chmodSync(targetDbPath, 0o666);
      }
    }
    databaseUrl = `file:${targetDbPath}`;
  } catch (err) {
    console.error("Failed to copy SQLite database to writable /tmp directory:", err);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
