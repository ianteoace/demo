"use server"

import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import type { SetPasswordActionState } from "./state"

const MIN_PASSWORD_LENGTH = 8

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function setPasswordAction(
  _prevState: SetPasswordActionState,
  formData: FormData,
): Promise<SetPasswordActionState> {
  try {
    const token = getString(formData, "token")
    const password = getString(formData, "password")
    const confirmPassword = getString(formData, "confirmPassword")

    if (!token) {
      return {
        error: "Token de activacion requerido.",
        success: false,
      }
    }

    if (!password || !confirmPassword) {
      return {
        error: "Contrasena y confirmacion son obligatorias.",
        success: false,
      }
    }

    if (password !== confirmPassword) {
      return {
        error: "Las contrasenas no coinciden.",
        success: false,
      }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        error: `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        success: false,
      }
    }

    const user = await prisma.user.findUnique({
      where: { passwordSetupToken: token },
    })

    if (!user) {
      return {
        error: "Token invalido o usuario no encontrado.",
        success: false,
      }
    }

    if (!user.mustSetPassword) {
      return {
        error: "Este acceso ya fue activado.",
        success: false,
      }
    }

    if (!user.passwordSetupExpiresAt || user.passwordSetupExpiresAt < new Date()) {
      return {
        error: "El enlace de activacion ha expirado.",
        success: false,
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustSetPassword: false,
        passwordSetupToken: null,
        passwordSetupExpiresAt: null,
      },
    })

    return {
      error: null,
      success: true,
    }
  } catch (error) {
    console.error("SET PASSWORD ACTION ERROR:", error)
    return {
      error: "No se pudo activar el acceso.",
      success: false,
    }
  }
}
