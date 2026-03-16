"use server"

import { LeadStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import type { LeadActionState } from "./lead-action-state"

const LEAD_LIMITS = {
  nameMax: 80,
  emailMax: 120,
  messageMin: 10,
  messageMax: 1500,
  cooldownMinutes: 3,
} as const

function parseLeadFormData(propertyId: string, formData: FormData) {
  const nameValue = formData.get("name")
  const emailValue = formData.get("email")
  const messageValue = formData.get("message")
  const websiteValue = formData.get("website")

  const name = typeof nameValue === "string" ? nameValue.trim() : ""
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : ""
  const message = typeof messageValue === "string" ? messageValue.trim() : ""
  const website = typeof websiteValue === "string" ? websiteValue.trim() : ""

  if (website) {
    return {
      error: "No se pudo procesar la consulta.",
    } as const
  }

  if (!propertyId || !name || !email || !message) {
    return {
      error: "Nombre, email y mensaje son obligatorios.",
    } as const
  }

  if (name.length > LEAD_LIMITS.nameMax) {
    return {
      error: `El nombre no puede superar los ${LEAD_LIMITS.nameMax} caracteres.`,
    } as const
  }

  if (email.length > LEAD_LIMITS.emailMax) {
    return {
      error: `El email no puede superar los ${LEAD_LIMITS.emailMax} caracteres.`,
    } as const
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return {
      error: "El email no tiene un formato válido.",
    } as const
  }

  if (message.length < LEAD_LIMITS.messageMin) {
    return {
      error: `El mensaje debe tener al menos ${LEAD_LIMITS.messageMin} caracteres.`,
    } as const
  }

  if (message.length > LEAD_LIMITS.messageMax) {
    return {
      error: `El mensaje no puede superar los ${LEAD_LIMITS.messageMax} caracteres.`,
    } as const
  }

  return {
    data: {
      name,
      email,
      message,
      propertyId,
    },
  } as const
}

export async function createLeadAction(
  propertyId: string,
  _prevState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const parsed = parseLeadFormData(propertyId, formData)

  if ("error" in parsed) {
    return {
      error: parsed.error ?? "No se pudo validar la consulta.",
      success: null,
    }
  }

  const property = await prisma.property.findUnique({
    where: { id: parsed.data.propertyId },
  })

  if (!property) {
    return {
      error: "La propiedad no existe.",
      success: null,
    }
  }

  const recentThreshold = new Date(Date.now() - LEAD_LIMITS.cooldownMinutes * 60 * 1000)
  const recentLead = await prisma.lead.findFirst({
    where: {
      propertyId: parsed.data.propertyId,
      email: parsed.data.email,
      createdAt: {
        gte: recentThreshold,
      },
    },
    select: { id: true },
  })

  if (recentLead) {
    return {
      error: `Ya recibimos tu consulta hace instantes. Intenta nuevamente en ${LEAD_LIMITS.cooldownMinutes} minutos.`,
      success: null,
    }
  }

  await prisma.lead.create({
    data: {
      ...parsed.data,
      status: LeadStatus.NEW,
    },
  })

  revalidatePath("/propiedades")
  revalidatePath(`/propiedad/${propertyId}`)
  revalidatePath(`/propiedad/${property.slug}`)
  revalidatePath("/dashboard/properties")
  revalidatePath("/dashboard/leads")

  return {
    error: null,
    success: "Consulta enviada correctamente.",
  }
}
