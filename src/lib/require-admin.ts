import type { Session } from "next-auth"
import { Role } from "@prisma/client"
import { getAuthSession } from "@/auth"

export class AdminAuthorizationError extends Error {
  constructor(message = "No autorizado") {
    super(message)
    this.name = "AdminAuthorizationError"
  }
}

export async function requireAdmin(session?: Session | null) {
  const resolvedSession = session ?? (await getAuthSession())

  if (
    !resolvedSession ||
    !resolvedSession.user ||
    !resolvedSession.user.role ||
    resolvedSession.user.role !== Role.ADMIN
  ) {
    throw new AdminAuthorizationError()
  }

  return resolvedSession
}
