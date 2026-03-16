"use server"

import { revalidatePath } from "next/cache"

import { cloudinary } from "@/lib/cloudinary"
import { prisma } from "@/lib/prisma"
import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"
import type { PropertyImageActionState } from "./property-image-action-state"

function getActionError(error: unknown, fallback: string) {
  if (error instanceof AdminAuthorizationError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

async function ensurePropertyExists(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  })

  if (!property) {
    throw new Error("Propiedad no encontrada.")
  }
}

async function revalidatePropertyPaths(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { slug: true },
  })

  revalidatePath("/dashboard/properties")
  revalidatePath(`/dashboard/properties/${propertyId}/images`)
  revalidatePath("/propiedades")
  revalidatePath(`/propiedad/${propertyId}`)

  if (property) {
    revalidatePath(`/propiedad/${property.slug}`)
  }
}

export async function uploadPropertyImageAction(
  propertyId: string,
  _prevState: PropertyImageActionState,
  formData: FormData,
): Promise<PropertyImageActionState> {
  try {
    await requireAdmin()
    await ensurePropertyExists(propertyId)

    const file = formData.get("image")

    if (!(file instanceof File)) {
      return { error: "Debes seleccionar una imagen valida." }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<{
      secure_url: string
      public_id: string
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "inmobiliaria-saas/properties",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("No se pudo subir la imagen."))
              return
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            })
          },
        )
        .end(buffer)
    })

    const currentPrimary = await prisma.propertyImage.findFirst({
      where: {
        propertyId,
        isPrimary: true,
      },
      select: { id: true },
    })

    await prisma.propertyImage.create({
      data: {
        propertyId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        isPrimary: !currentPrimary,
      },
    })

    await revalidatePropertyPaths(propertyId)

    return { error: null }
  } catch (error) {
    return {
      error: getActionError(error, "No se pudo guardar la imagen."),
    }
  }
}

export async function deletePropertyImageAction(
  propertyId: string,
  _prevState: PropertyImageActionState,
  formData: FormData,
): Promise<PropertyImageActionState> {
  try {
    await requireAdmin()

    const imageIdValue = formData.get("imageId")
    const imageId =
      typeof imageIdValue === "string" ? imageIdValue.trim() : ""

    if (!imageId) {
      return { error: "El identificador de la imagen es obligatorio." }
    }

    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId,
      },
    })

    if (!image) {
      return { error: "Imagen no encontrada." }
    }

    if (image.publicId) {
      const destroyResult = await cloudinary.uploader.destroy(image.publicId, {
        resource_type: "image",
      })

      if (
        destroyResult.result !== "ok" &&
        destroyResult.result !== "not found"
      ) {
        return { error: "No se pudo eliminar la imagen en Cloudinary." }
      }
    }

    await prisma.propertyImage.delete({
      where: { id: image.id },
    })

    if (image.isPrimary) {
      const nextImage = await prisma.propertyImage.findFirst({
        where: { propertyId },
        orderBy: { createdAt: "asc" },
      })

      if (nextImage) {
        await prisma.propertyImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        })
      }
    }

    await revalidatePropertyPaths(propertyId)

    return { error: null }
  } catch (error) {
    return {
      error: getActionError(error, "No se pudo eliminar la imagen."),
    }
  }
}

export async function setPrimaryImageAction(
  propertyId: string,
  _prevState: PropertyImageActionState,
  formData: FormData,
): Promise<PropertyImageActionState> {
  try {
    await requireAdmin()

    const imageIdValue = formData.get("imageId")
    const imageId =
      typeof imageIdValue === "string" ? imageIdValue.trim() : ""

    if (!imageId) {
      return { error: "El identificador de la imagen es obligatorio." }
    }

    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId,
      },
      select: { id: true },
    })

    if (!image) {
      return { error: "Imagen no encontrada." }
    }

    await prisma.$transaction([
      prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isPrimary: false },
      }),
      prisma.propertyImage.update({
        where: { id: image.id },
        data: { isPrimary: true },
      }),
    ])

    await revalidatePropertyPaths(propertyId)

    return { error: null }
  } catch (error) {
    return {
      error: getActionError(error, "No se pudo cambiar la imagen principal."),
    }
  }
}
