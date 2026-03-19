"use server"

import { Prisma, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

import { assertBootstrapAccess } from "@/lib/bootstrap"
import { prisma } from "@/lib/prisma"
import type { RegisterActionState } from "./state"

const MIN_PASSWORD_LENGTH = 8

function getString(
  formData: FormData,
  key: "name" | "email" | "password" | "bootstrapToken",
) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function registerAdminAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  try {
    const bootstrapToken = getString(formData, "bootstrapToken")
    const bootstrapAccess = assertBootstrapAccess(bootstrapToken)
    if (!bootstrapAccess.ok) {
      return {
        error: bootstrapAccess.message,
        success: false,
      }
    }

    const name = getString(formData, "name")
    const email = getString(formData, "email").toLowerCase()
    const password = getString(formData, "password")

    if (!name || !email || !password) {
      return {
        error: "Nombre, email y contraseña son obligatorios.",
        success: false,
      }
    }

    if (name.length > 80) {
      return {
        error: "El nombre no puede superar los 80 caracteres.",
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

    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        success: false,
      }
    }

    const existingUsersCount = await prisma.user.count()
    if (existingUsersCount > 0) {
      return {
        error:
          "La aplicacion ya fue configurada. Inicia sesion con la cuenta administradora existente.",
        success: false,
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingUser) {
      return {
        error: "El email ya existe. Inicia sesion o usa otro email.",
        success: false,
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        mustSetPassword: false,
        role: Role.ADMIN,
      },
    })

    return {
      error: null,
      success: true,
    }
  } catch (error) {
    console.error("REGISTER ACTION ERROR:", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "El email ya existe. Inicia sesion o usa otro email.",
        success: false,
      }
    }

    return {
      error: "No se pudo completar el registro inicial.",
      success: false,
    }
  }
}
