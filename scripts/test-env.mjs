import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"

function loadEnvFile(fileName) {
  const absolutePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(absolutePath)) return
  dotenv.config({ path: absolutePath, override: true })
}

export function buildTestEnv() {
  loadEnvFile(".env.test")
  loadEnvFile(".env.test.local")

  const testDatabaseUrl = process.env.TEST_DATABASE_URL_UNIT?.trim()
  if (!testDatabaseUrl) {
    throw new Error(
      "Missing TEST_DATABASE_URL_UNIT for tests. Define it in .env.test or .env.test.local.",
    )
  }

  const env = { ...process.env }
  env.SOLOADEREZOS_DATABASE_URL = testDatabaseUrl
  env.DATABASE_URL = testDatabaseUrl

  if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
    env.NEXTAUTH_SECRET = "test-secret-min-32-chars-1234567890"
  }
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
    env.AUTH_SECRET = env.NEXTAUTH_SECRET
  }
  if (env.AUTH_SECRET !== env.NEXTAUTH_SECRET) {
    env.AUTH_SECRET = env.NEXTAUTH_SECRET
  }
  if (!env.APP_URL) {
    env.APP_URL = "http://127.0.0.1:3100"
  }
  if (!env.NEXTAUTH_URL) {
    env.NEXTAUTH_URL = env.APP_URL
  }
  if (!env.PLAYWRIGHT_BASE_URL) {
    env.PLAYWRIGHT_BASE_URL = "http://127.0.0.1:3100"
  }

  if (!env.SEED_ADMIN_EMAIL) {
    env.SEED_ADMIN_EMAIL = "admin@soloaderezos.test"
  }
  if (!env.SEED_ADMIN_PASSWORD) {
    env.SEED_ADMIN_PASSWORD = "TestAdmin123!"
  }
  if (!env.SEED_ADMIN_NAME) {
    env.SEED_ADMIN_NAME = "Admin Seed"
  }
  if (!env.E2E_ADMIN_EMAIL) {
    env.E2E_ADMIN_EMAIL = env.SEED_ADMIN_EMAIL
  }
  if (!env.E2E_ADMIN_PASSWORD) {
    env.E2E_ADMIN_PASSWORD = env.SEED_ADMIN_PASSWORD
  }

  return env
}
