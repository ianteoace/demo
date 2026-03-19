import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"

function loadIfExists(fileName: string) {
  const absolutePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(absolutePath)) return
  dotenv.config({ path: absolutePath, override: true })
}

loadIfExists(".env.test")
loadIfExists(".env.test.local")

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim()
if (testDatabaseUrl) {
  process.env.SOLOADEREZOS_DATABASE_URL = testDatabaseUrl
  process.env.DATABASE_URL = testDatabaseUrl
}
