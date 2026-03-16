"use server"

import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { getAuthSession } from "@/auth"
import {
  DEMO_PROPERTY_SLUGS,
  seedDemoData,
} from "@/lib/demo/seed-demo-data"
import { prisma } from "@/lib/prisma"
import type { LoadDemoDataActionResult } from "./load-demo-data.types"

export async function loadDemoDataAction(): Promise<LoadDemoDataActionResult> {
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      message: "La carga demo esta deshabilitada en produccion.",
    }
  }

  const session = await getAuthSession()

  if (!session?.user) {
    return {
      success: false,
      message: "Debes iniciar sesion para ejecutar esta accion.",
    }
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      success: false,
      message: "Solo un usuario admin puede cargar datos demo.",
    }
  }

  try {
    const summary = await seedDemoData(prisma)

    revalidatePath("/")
    revalidatePath("/propiedades")
    revalidatePath("/dashboard/properties")
    revalidatePath("/dashboard/leads")
    for (const slug of DEMO_PROPERTY_SLUGS) {
      revalidatePath(`/propiedad/${slug}`)
    }

    return {
      success: true,
      message: "Datos demo cargados correctamente.",
      summary,
    }
  } catch {
    return {
      success: false,
      message: "No se pudieron cargar los datos demo. Revisa la conexion a la base de datos.",
    }
  }
}
