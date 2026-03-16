"use server"

import { randomBytes } from "crypto"
import { addDays } from "date-fns"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { getAuthSession } from "@/auth"
import { getAppUrl } from "@/lib/app-url"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import type { UserActionState } from "./state"

const PROTECTED_ADMIN_EMAIL = "admin@inmo.com"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function createUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return {
        error: "No autorizado.",
        success: false,
      }
    }
    await requireAdmin(session)

    const email = getString(formData, "email").toLowerCase()

    if (!email) {
      return {
        error: "Email es obligatorio.",
        success: false,
      }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return {
        error: "El email no tiene un formato valido.",
        success: false,
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingUser) {
      return {
        error: "El email ya existe.",
        success: false,
      }
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = addDays(new Date(), 7)

    await prisma.user.create({
      data: {
        email,
        passwordHash: null,
        mustSetPassword: true,
        passwordSetupToken: token,
        passwordSetupExpiresAt: expiresAt,
      },
    })

    const activationLink = `${getAppUrl()}/activar-acceso?token=${token}`
    console.log(`Usuario creado: ${email}`)
    console.log(`Link de activacion: ${activationLink}`)

    revalidatePath("/dashboard/users")

    return {
      error: null,
      success: true,
    }
  } catch (error) {
    console.error("CREATE USER ACTION ERROR:", error)
    return {
      error: "No se pudo crear el usuario.",
      success: false,
    }
  }
}

export async function regenerateActivationLinkAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return {
        error: "No autorizado.",
        success: false,
      }
    }
    await requireAdmin(session)

    const userId = getString(formData, "userId")
    if (!userId) {
      return {
        error: "ID de usuario requerido.",
        success: false,
      }
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
      return {
        error: "Usuario no encontrado.",
        success: false,
      }
    }

    if (!user.mustSetPassword) {
      return {
        error: "El usuario ya activo su acceso.",
        success: false,
      }
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

    const activationLink = `${getAppUrl()}/activar-acceso?token=${token}`
    console.log(`Link de activacion regenerado para ${user.email}: ${activationLink}`)

    revalidatePath("/dashboard/users")

    return {
      error: null,
      success: true,
    }
  } catch (error) {
    console.error("REGENERATE ACTIVATION LINK ACTION ERROR:", error)
    return {
      error: "No se pudo regenerar el enlace.",
      success: false,
    }
  }
}

export async function deleteUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  try {
    const session = await getAuthSession()
    if (!session) {
      return {
        error: "No autorizado.",
        success: false,
      }
    }
    await requireAdmin(session)

    const userId = getString(formData, "userId")

    if (!userId) {
      return {
        error: "ID de usuario requerido.",
        success: false,
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return {
        error: "Usuario no encontrado.",
        success: false,
      }
    }

    if (user.email.toLowerCase() === PROTECTED_ADMIN_EMAIL) {
      return {
        error: "No se puede eliminar el administrador principal del sistema.",
        success: false,
      }
    }

    if (session.user.id === user.id || user.email === session.user.email) {
      return {
        error: "No puedes eliminarte a ti mismo.",
        success: false,
      }
    }

    if (user.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      })

      if (adminCount <= 1) {
        return {
          error: "No puedes eliminar al ultimo admin.",
          success: false,
        }
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath("/dashboard/users")

    return {
      error: null,
      success: true,
    }
  } catch (error) {
    console.error("DELETE USER ACTION ERROR:", error)
    return {
      error: "No se pudo eliminar el usuario.",
      success: false,
    }
  }
}
