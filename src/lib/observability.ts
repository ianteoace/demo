type LogLevel = "info" | "warn" | "error"

type LogContext = Record<string, unknown>

function normalizeContext(context?: LogContext) {
  if (!context) return {}
  return context
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export function logBusinessEvent(event: string, context?: LogContext) {
  console.info("[biz-event]", {
    at: new Date().toISOString(),
    event,
    ...normalizeContext(context),
  })
}

export function logAppError(scope: string, error: unknown, context?: LogContext, level: LogLevel = "error") {
  const payload = {
    at: new Date().toISOString(),
    scope,
    message: toErrorMessage(error),
    ...normalizeContext(context),
  }

  if (level === "warn") {
    console.warn("[app-error]", payload)
    return
  }

  console.error("[app-error]", payload)
}

