function normalizeAbsoluteUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export function getAppUrl() {
  const baseUrl = normalizeAbsoluteUrl(
    process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000",
  )

  return baseUrl.replace(/\/+$/, "")
}
