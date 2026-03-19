import { spawnSync } from "node:child_process"

import { buildTestEnv } from "./test-env.mjs"

const env = buildTestEnv()
Object.assign(process.env, env)

const extraArgs = process.argv.slice(2)
const vitestArgs = extraArgs.length > 0 ? extraArgs : ["run"]
const isWindows = process.platform === "win32"

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

runOrExit(isWindows ? "npm.cmd exec -- prisma migrate deploy" : "npm exec -- prisma migrate deploy")
runOrExit(
  isWindows
    ? `npm.cmd exec -- vitest ${vitestArgs.join(" ")}`
    : `npm exec -- vitest ${vitestArgs.join(" ")}`,
)
