import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";
const dedicatedDatabaseUrl = process.env.SOLOADEREZOS_DATABASE_URL;
const fallbackDatabaseUrl = process.env.DATABASE_URL;

const databaseUrl = isProduction
  ? dedicatedDatabaseUrl
  : dedicatedDatabaseUrl || fallbackDatabaseUrl;

if (!databaseUrl) {
  const message = isProduction
    ? "Missing SOLOADEREZOS_DATABASE_URL. Production requires a dedicated database URL and does not allow DATABASE_URL fallback."
    : "Missing database URL. Configure SOLOADEREZOS_DATABASE_URL (recommended) or DATABASE_URL.";

  throw new Error(
    message,
  );
}

if (!isProduction && !dedicatedDatabaseUrl && fallbackDatabaseUrl) {
  console.warn(
    "[prisma] Using DATABASE_URL fallback. Configure SOLOADEREZOS_DATABASE_URL to isolate this project.",
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
