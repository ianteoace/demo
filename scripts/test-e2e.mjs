import { spawnSync } from "node:child_process"

import { buildTestEnv } from "./test-env.mjs"

const env = buildTestEnv()
Object.assign(process.env, env)

const args = process.argv.slice(2)
const skipPrepare = args.includes("--skip-prepare")
const playwrightArgs = args.filter((arg) => arg !== "--skip-prepare")

function runOrExit(command) {
  const result = spawnSync(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!skipPrepare) {
  runOrExit(process.platform === "win32" ? "npm.cmd exec -- prisma migrate deploy" : "npm exec -- prisma migrate deploy")
  runOrExit(process.platform === "win32" ? "npm.cmd run seed" : "npm run seed")
  runOrExit(process.platform === "win32" ? "npm.cmd run build" : "npm run build")
}

runOrExit(
  process.platform === "win32"
    ? `npm.cmd exec -- playwright ${
        (playwrightArgs.length > 0 ? playwrightArgs : ["test"]).join(" ")
      }`
    : `npm exec -- playwright ${
        (playwrightArgs.length > 0 ? playwrightArgs : ["test"]).join(" ")
      }`,
)
