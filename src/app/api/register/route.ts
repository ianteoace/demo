import { Prisma, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import { assertBootstrapAccess } from "@/lib/bootstrap"
import { prisma } from "@/lib/prisma"

type RegisterBody = {
  name?: string
  nombre?: string
  email?: string
  password?: string
  bootstrapToken?: string
}

const MIN_PASSWORD_LENGTH = 8

function validateRegisterInput(body: RegisterBody) {
  const name = body.name?.trim() || body.nombre?.trim() || null
  const email = body.email?.trim().toLowerCase()
  const password = body.password?.trim()

  if (!name || !email || !password) {
    return {
      error: "Nombre, email y contrasena son obligatorios.",
      status: 400,
    } as const
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email)) {
    return {
      error: "El email no tiene un formato valido.",
      status: 400,
    } as const
  }

  if (name.length > 80) {
    return {
      error: "El nombre no puede superar los 80 caracteres.",
      status: 400,
    } as const
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      status: 400,
    } as const
  }

  return {
    name,
    email,
    password,
  } as const
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterBody
    const bootstrapTokenHeader = req.headers.get("x-bootstrap-token")
    const bootstrapToken = body.bootstrapToken?.trim() || bootstrapTokenHeader
    const bootstrapAccess = assertBootstrapAccess(bootstrapToken)

    if (!bootstrapAccess.ok) {
      return NextResponse.json(
        { error: bootstrapAccess.message },
        { status: 403 },
      )
    }

    const result = validateRegisterInput(body)

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      )
    }

    const existingUsersCount = await prisma.user.count()

    if (existingUsersCount > 0) {
      return NextResponse.json(
        {
          error:
            "La aplicacion ya fue configurada. Inicia sesion con la cuenta administradora existente.",
        },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(result.password, 10)

    const user = await prisma.user.create({
      data: {
        email: result.email,
        passwordHash,
        name: result.name,
        role: Role.ADMIN,
      },
    })

    return NextResponse.json(
      {
        ok: true,
        message: "Cuenta administradora creada correctamente.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("REGISTER ERROR:", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "El email ya existe. Inicia sesion o usa otro email.",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: "No se pudo completar el registro inicial." },
      { status: 500 },
    )
  }
}
