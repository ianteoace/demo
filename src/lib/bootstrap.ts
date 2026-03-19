function normalizeToken(value: string | undefined | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed || null
}

function isBootstrapEnabledFlag() {
  return process.env.ENABLE_INITIAL_ADMIN_BOOTSTRAP === "true"
}

function getExpectedBootstrapToken() {
  return normalizeToken(process.env.INITIAL_ADMIN_BOOTSTRAP_TOKEN)
}

export function isBootstrapAllowedInCurrentEnv() {
  if (process.env.NODE_ENV !== "production") {
    return true
  }

  return isBootstrapEnabledFlag() && Boolean(getExpectedBootstrapToken())
}

export function assertBootstrapAccess(providedToken?: string | null): {
  ok: boolean
  message: string
} {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, message: "" }
  }

  if (!isBootstrapEnabledFlag()) {
    return {
      ok: false,
      message:
        "Bootstrap inicial deshabilitado en produccion. Activalo temporalmente con ENABLE_INITIAL_ADMIN_BOOTSTRAP=true.",
    }
  }

  const expectedToken = getExpectedBootstrapToken()
  if (!expectedToken) {
    return {
      ok: false,
      message:
        "INITIAL_ADMIN_BOOTSTRAP_TOKEN no esta configurado. No se permite bootstrap inicial en produccion.",
    }
  }

  const receivedToken = normalizeToken(providedToken)
  if (!receivedToken || receivedToken !== expectedToken) {
    return {
      ok: false,
      message: "Token de bootstrap invalido o ausente.",
    }
  }

  return { ok: true, message: "" }
}

