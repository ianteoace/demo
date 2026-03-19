"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { logAppError, logBusinessEvent } from "@/lib/observability"
import { buildProductBaseSlug, ensureUniqueProductSlug } from "@/lib/product-slug"
import { prisma } from "@/lib/prisma"
import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"
import { parseProductFormData } from "@/types/product"
import type { ProductActionState } from "./product-action-state"

function getAuthorizationError(error: unknown) {
  if (error instanceof AdminAuthorizationError) {
    return error.message
  }

  return null
}

async function ensureCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })

  return Boolean(category)
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return {
      error: getAuthorizationError(error) || "No autorizado para crear productos.",
    }
  }

  const parsed = parseProductFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error }
  }

  const categoryExists = await ensureCategoryExists(parsed.data.categoryId)
  if (!categoryExists) {
    return { error: "La categoria seleccionada no existe." }
  }

  const baseSlug =
    parsed.data.slug || buildProductBaseSlug(parsed.data.name, parsed.data.brand)
  const slug = await ensureUniqueProductSlug(baseSlug)

  await prisma.product.create({
    data: {
      ...parsed.data,
      slug,
    },
  })

  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/inquiries")
  redirect("/dashboard/products")
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return {
      error: getAuthorizationError(error) || "No autorizado para editar productos.",
    }
  }

  const parsed = parseProductFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error }
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  })

  if (!existingProduct) {
    return { error: "Producto no encontrado." }
  }

  const categoryExists = await ensureCategoryExists(parsed.data.categoryId)
  if (!categoryExists) {
    return { error: "La categoria seleccionada no existe." }
  }

  const baseSlug =
    parsed.data.slug || buildProductBaseSlug(parsed.data.name, parsed.data.brand)
  const slug = await ensureUniqueProductSlug(baseSlug, existingProduct.id)

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...parsed.data,
      slug,
    },
  })

  revalidatePath("/dashboard/products")
  revalidatePath(`/dashboard/products/${productId}/edit`)
  revalidatePath(`/dashboard/products/${productId}/images`)
  revalidatePath("/dashboard/inquiries")
  redirect("/dashboard/products")
}

export async function toggleProductOnSaleAction(productId: string, nextIsOnSale: boolean) {
  let session
  try {
    session = await requireAdmin()
  } catch (error) {
    logAppError("products.toggle_on_sale.auth", error, { productId }, "warn")
    return
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!existingProduct) {
    return
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isOnSale: nextIsOnSale },
  })

  logBusinessEvent("product.sale_toggled", {
    actorEmail: session?.user.email,
    productId,
    isOnSale: nextIsOnSale,
  })

  revalidatePath("/dashboard/products")
}

export async function toggleProductActiveAction(productId: string, nextIsActive: boolean) {
  let session
  try {
    session = await requireAdmin()
  } catch (error) {
    logAppError("products.toggle_active.auth", error, { productId }, "warn")
    return
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  })

  if (!existingProduct) {
    return
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: nextIsActive },
  })

  logBusinessEvent("product.active_toggled", {
    actorEmail: session?.user.email,
    productId,
    slug: existingProduct.slug,
    isActive: nextIsActive,
  })

  revalidatePath("/")
  revalidatePath("/productos")
  revalidatePath(`/producto/${existingProduct.slug}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/products")
}
