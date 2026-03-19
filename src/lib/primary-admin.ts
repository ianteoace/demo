function normalizeEmail(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim().toLowerCase()
  return trimmed || null
}

export function getPrimaryAdminEmail(): string {
  const isProduction = process.env.NODE_ENV === "production"
  const primaryAdminEmail = normalizeEmail(process.env.PRIMARY_ADMIN_EMAIL)

  if (isProduction) {
    if (!primaryAdminEmail) {
      throw new Error(
        "[primary-admin] Missing PRIMARY_ADMIN_EMAIL. Production requires an explicit protected admin email.",
      )
    }

    return primaryAdminEmail
  }

  return (
    primaryAdminEmail ||
    normalizeEmail(process.env.DEMO_ADMIN_EMAIL) ||
    "admin@soloaderezos.com"
  )
}
