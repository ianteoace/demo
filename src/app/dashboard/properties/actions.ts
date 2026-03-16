"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { buildPropertyBaseSlug, ensureUniquePropertySlug } from "@/lib/property-slug"
import { prisma } from "@/lib/prisma"
import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"
import {
  parsePropertyFormData,
  type PropertyActionState,
} from "@/types/property"

function getAuthorizationError(error: unknown) {
  if (error instanceof AdminAuthorizationError) {
    return error.message
  }

  return null
}

export async function createPropertyAction(
  _prevState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return {
      error: getAuthorizationError(error) || "No autorizado para crear propiedades.",
    }
  }

  const parsed = parsePropertyFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error }
  }

  const baseSlug = buildPropertyBaseSlug(parsed.data.title, parsed.data.city)
  const slug = await ensureUniquePropertySlug(baseSlug)

  await prisma.property.create({
    data: {
      ...parsed.data,
      slug,
    },
  })

  revalidatePath("/dashboard/properties")
  revalidatePath("/propiedades")
  redirect("/dashboard/properties")
}

export async function updatePropertyAction(
  propertyId: string,
  _prevState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return {
      error: getAuthorizationError(error) || "No autorizado para editar propiedades.",
    }
  }

  const parsed = parsePropertyFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error }
  }

  const existingProperty = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!existingProperty) {
    return { error: "Propiedad no encontrada." }
  }

  const baseSlug = buildPropertyBaseSlug(parsed.data.title, parsed.data.city)
  const slug = await ensureUniquePropertySlug(baseSlug, existingProperty.id)

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      ...parsed.data,
      slug,
    },
  })

  revalidatePath("/dashboard/properties")
  revalidatePath("/propiedades")
  revalidatePath(`/propiedad/${existingProperty.id}`)
  revalidatePath(`/propiedad/${slug}`)
  redirect("/dashboard/properties")
}

export async function deletePropertyAction(
  propertyId: string,
  _formData: FormData,
) {
  await requireAdmin()

  const existingProperty = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!existingProperty) {
    return
  }

  await prisma.property.delete({
    where: { id: propertyId },
  })

  revalidatePath("/dashboard/properties")
  revalidatePath("/propiedades")
}
