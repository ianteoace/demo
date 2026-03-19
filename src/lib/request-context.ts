import { headers } from "next/headers"

function normalizeIp(value: string | null) {
  return value?.trim().toLowerCase() || ""
}

export async function getRequestClientIp(): Promise<string> {
  try {
    const headerStore = await headers()
    const forwardedFor = normalizeIp(headerStore.get("x-forwarded-for"))
    const realIp = normalizeIp(headerStore.get("x-real-ip"))
    const cfIp = normalizeIp(headerStore.get("cf-connecting-ip"))

    return (
      forwardedFor.split(",")[0]?.trim() ||
      realIp ||
      cfIp ||
      "unknown"
    )
  } catch {
    // Unit tests and non-request invocations run without Next request scope.
    return "unknown"
  }
}
