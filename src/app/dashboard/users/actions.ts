"use server"

import { randomBytes } from "crypto"
import { addDays } from "date-fns"
import { Prisma, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

import { getAuthSession } from "@/auth"
import { getAppUrl } from "@/lib/app-url"
import { logAppError, logBusinessEvent } from "@/lib/observability"
import { getPrimaryAdminEmail } from "@/lib/primary-admin"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import type { UserActionState } from "./state"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function buildTemporaryPassword() {
  const base = randomBytes(9).toString("base64url")
  return `${base}A1!`
}

function successState(activationLink: string | null = null): UserActionState {
  return {
    error: null,
    success: true,
    activationLink,
  }
}

function errorState(error: string): UserActionState {
  return {
    error,
    success: false,
    activationLink: null,
  }
}

export async function createUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return errorState("No autorizado.")
    }
    await requireAdmin(session)

    const email = getString(formData, "email").toLowerCase()

    if (!email) {
      return errorState("Email es obligatorio.")
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return errorState("El email no tiene un formato valido.")
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingUser) {
      return errorState("El email ya existe.")
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = addDays(new Date(), 7)
    const temporaryPassword = buildTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, 10)

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.ADMIN,
        mustSetPassword: true,
        passwordSetupToken: token,
        passwordSetupExpiresAt: expiresAt,
      },
    })

    logBusinessEvent("user.created", {
      actorEmail: session.user.email,
      createdUserEmail: email,
      role: Role.ADMIN,
      mustSetPassword: true,
    })
    console.info("[users] activation-link-created", { userEmail: email })

    revalidatePath("/dashboard/users")

    return successState()
  } catch (error) {
    logAppError("users.create", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorState("El email ya existe.")
    }

    return errorState("No se pudo crear el usuario. Revisa los logs del servidor para mas detalle.")
  }
}

export async function regenerateActivationLinkAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return errorState("No autorizado.")
    }
    await requireAdmin(session)

    const userId = getString(formData, "userId")
    if (!userId) {
      return errorState("ID de usuario requerido.")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mustSetPassword: true,
      },
    })

    if (!user) {
      return errorState("Usuario no encontrado.")
    }

    if (!user.mustSetPassword) {
      return errorState("El usuario ya activo su acceso.")
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = addDays(new Date(), 7)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordSetupToken: token,
        passwordSetupExpiresAt: expiresAt,
      },
    })

    logBusinessEvent("user.activation_link.regenerated", {
      actorEmail: session.user.email,
      userEmail: user.email,
    })
    console.info("[users] activation-link-regenerated", { userEmail: user.email })

    revalidatePath("/dashboard/users")

    return successState()
  } catch (error) {
    logAppError("users.regenerate_activation_link", error)
    return errorState("No se pudo regenerar el enlace.")
  }
}

export async function copyActivationLinkAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return errorState("No autorizado.")
    }
    await requireAdmin(session)

    const userId = getString(formData, "userId")
    if (!userId) {
      return errorState("ID de usuario requerido.")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mustSetPassword: true,
        passwordSetupToken: true,
      },
    })

    if (!user) {
      return errorState("Usuario no encontrado.")
    }

    if (!user.mustSetPassword || !user.passwordSetupToken) {
      return errorState("El usuario no tiene activacion pendiente.")
    }

    const activationLink = `${getAppUrl()}/activar-acceso?token=${user.passwordSetupToken}`
    return successState(activationLink)
  } catch (error) {
    logAppError("users.copy_activation_link", error)
    return errorState("No se pudo generar el enlace de activacion.")
  }
}

export async function deleteUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return errorState("No autorizado.")
    }
    await requireAdmin(session)

    const userId = getString(formData, "userId")

    if (!userId) {
      return errorState("ID de usuario requerido.")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return errorState("Usuario no encontrado.")
    }

    const protectedAdminEmail = getPrimaryAdminEmail()
    if (user.email.toLowerCase() === protectedAdminEmail) {
      return errorState("No se puede eliminar el administrador principal del sistema.")
    }

    if (
      session.user.id === user.id ||
      user.email.toLowerCase() === (session.user.email || "").toLowerCase()
    ) {
      return errorState("No puedes eliminarte a ti mismo.")
    }

    if (user.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      })

      if (adminCount <= 1) {
        return errorState("No puedes eliminar al ultimo admin.")
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    logBusinessEvent("user.deleted", {
      actorEmail: session.user.email,
      deletedUserId: user.id,
      deletedUserEmail: user.email,
    })

    revalidatePath("/dashboard/users")

    return successState()
  } catch (error) {
    logAppError("users.delete", error)
    return errorState("No se pudo eliminar el usuario.")
  }
}

