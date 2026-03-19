"use server"

import { revalidatePath } from "next/cache"

import {
  assertCloudinaryConfig,
  cloudinary,
  formatCloudinaryError,
  verifyCloudinaryConnection,
} from "@/lib/cloudinary"
import { logAppError } from "@/lib/observability"
import { prisma } from "@/lib/prisma"
import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"

import type { ProductImageActionState } from "./product-image-action-state"

const MAX_UPLOAD_SIZE_MB = 8
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
])

function getActionError(error: unknown, fallback: string) {
  if (error instanceof AdminAuthorizationError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return formatCloudinaryError(error, error.message)
  }

  return formatCloudinaryError(error, fallback)
}

async function ensureProductExists(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    throw new Error("Producto no encontrado.")
  }
}

async function revalidateProductPaths(productId: string) {
  revalidatePath("/dashboard/products")
  revalidatePath(`/dashboard/products/${productId}/images`)
  revalidatePath(`/dashboard/products/${productId}/edit`)
}

export async function uploadProductImageAction(
  productId: string,
  _prevState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  try {
    await requireAdmin()
    await ensureProductExists(productId)

    const file = formData.get("image")
    const altValue = formData.get("alt")
    const alt = typeof altValue === "string" ? altValue.trim() : ""

    if (!(file instanceof File)) {
      return { error: "Debes seleccionar una imagen valida." }
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.type)) {
      return {
        error: "Formato no permitido. Usa JPG, PNG, WEBP o AVIF.",
      }
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE_BYTES) {
      return {
        error: `La imagen supera el maximo permitido (${MAX_UPLOAD_SIZE_MB}MB).`,
      }
    }

    assertCloudinaryConfig()
    await verifyCloudinaryConnection()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<{
      secure_url: string
      public_id: string
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "soloaderezos/products",
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

    const maxSortOrder = await prisma.productImage.aggregate({
      where: { productId },
      _max: {
        sortOrder: true,
      },
    })

    await prisma.productImage.create({
      data: {
        productId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        alt: alt || null,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    })

    await revalidateProductPaths(productId)
    return { error: null }
  } catch (error) {
    logAppError("cloudinary.upload_product_image", error, { productId })
    return {
      error: getActionError(error, "No se pudo guardar la imagen."),
    }
  }
}

export async function deleteProductImageAction(
  productId: string,
  _prevState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  try {
    await requireAdmin()

    const imageIdValue = formData.get("imageId")
    const imageId = typeof imageIdValue === "string" ? imageIdValue.trim() : ""

    if (!imageId) {
      return { error: "El identificador de la imagen es obligatorio." }
    }

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    })

    if (!image) {
      return { error: "Imagen no encontrada." }
    }

    if (image.publicId) {
      assertCloudinaryConfig()
      await verifyCloudinaryConnection()

      const destroyResult = await cloudinary.uploader.destroy(image.publicId, {
        resource_type: "image",
      })

      if (destroyResult.result !== "ok" && destroyResult.result !== "not found") {
        return { error: "No se pudo eliminar la imagen en Cloudinary." }
      }
    }

    await prisma.productImage.delete({
      where: { id: image.id },
    })

    await revalidateProductPaths(productId)
    return { error: null }
  } catch (error) {
    logAppError("cloudinary.delete_product_image", error, { productId })
    return {
      error: getActionError(error, "No se pudo eliminar la imagen."),
    }
  }
}

export async function reorderProductImageAction(
  productId: string,
  _prevState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  try {
    await requireAdmin()

    const imageIdValue = formData.get("imageId")
    const directionValue = formData.get("direction")
    const imageId = typeof imageIdValue === "string" ? imageIdValue.trim() : ""
    const direction = typeof directionValue === "string" ? directionValue : ""

    if (!imageId || (direction !== "up" && direction !== "down")) {
      return { error: "Parametros de reordenamiento invalidos." }
    }

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
      select: {
        id: true,
        sortOrder: true,
      },
    })

    if (!image) {
      return { error: "Imagen no encontrada." }
    }

    const swapCandidate = await prisma.productImage.findFirst({
      where: {
        productId,
        ...(direction === "up"
          ? { sortOrder: { lt: image.sortOrder } }
          : { sortOrder: { gt: image.sortOrder } }),
      },
      orderBy: {
        sortOrder: direction === "up" ? "desc" : "asc",
      },
      select: {
        id: true,
        sortOrder: true,
      },
    })

    if (!swapCandidate) {
      return { error: null }
    }

    await prisma.$transaction([
      prisma.productImage.update({
        where: { id: image.id },
        data: { sortOrder: swapCandidate.sortOrder },
      }),
      prisma.productImage.update({
        where: { id: swapCandidate.id },
        data: { sortOrder: image.sortOrder },
      }),
    ])

    await revalidateProductPaths(productId)
    return { error: null }
  } catch (error) {
    logAppError("cloudinary.reorder_product_image", error, { productId })
    return {
      error: getActionError(error, "No se pudo reordenar la imagen."),
    }
  }
}
