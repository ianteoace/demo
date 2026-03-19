import "dotenv/config";
import { defineConfig } from "prisma/config";

const isProduction = process.env.NODE_ENV === "production";
const dedicatedDatabaseUrl = process.env.SOLOADEREZOS_DATABASE_URL;
const fallbackDatabaseUrl = process.env.DATABASE_URL;

const databaseUrl = isProduction
  ? dedicatedDatabaseUrl
  : dedicatedDatabaseUrl ?? fallbackDatabaseUrl;

if (isProduction && !dedicatedDatabaseUrl) {
  throw new Error(
    "[prisma-config] Missing SOLOADEREZOS_DATABASE_URL. Production requires a dedicated DB URL and disables DATABASE_URL fallback.",
  );
}

if (!isProduction && !dedicatedDatabaseUrl && fallbackDatabaseUrl) {
  console.warn(
    "[prisma-config] Using DATABASE_URL fallback. Prefer SOLOADEREZOS_DATABASE_URL for isolation.",
  );
}

export default defineConfig({
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl!,
  },
});
