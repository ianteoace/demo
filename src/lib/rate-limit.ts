import { getRequestClientIp } from "@/lib/request-context"

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitResult = {
  ok: boolean
  retryAfterSeconds: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const MAX_ENTRIES = 10_000

const globalForRateLimit = globalThis as unknown as {
  __soloaderezosRateLimitStore?: Map<string, RateLimitEntry>
}

function getStore() {
  if (!globalForRateLimit.__soloaderezosRateLimitStore) {
    globalForRateLimit.__soloaderezosRateLimitStore = new Map<string, RateLimitEntry>()
  }

  return globalForRateLimit.__soloaderezosRateLimitStore
}

function pruneStore(store: Map<string, RateLimitEntry>, now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key)
    }
  }

  if (store.size <= MAX_ENTRIES) return

  const overflow = store.size - MAX_ENTRIES
  let removed = 0
  for (const key of store.keys()) {
    store.delete(key)
    removed += 1
    if (removed >= overflow) {
      break
    }
  }
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const store = getStore()
  pruneStore(store, now)

  const existing = store.get(key)
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    )
    return { ok: false, retryAfterSeconds }
  }

  existing.count += 1
  store.set(key, existing)
  return { ok: true, retryAfterSeconds: 0 }
}

export async function getRateLimitClientKey(scope: string) {
  const ip = (await getRequestClientIp()).toLowerCase()

  return `${scope}:${ip}`
}
