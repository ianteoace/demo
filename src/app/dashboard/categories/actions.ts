"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"

import { buildCategorySlug } from "@/lib/category"
import { prisma } from "@/lib/prisma"
import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"
import { parseCategoryFormData } from "@/types/category"
import type { CategoryActionState } from "./category-action-state"

function getAuthorizationError(error: unknown) {
  if (error instanceof AdminAuthorizationError) {
    return error.message
  }

  return null
}

async function ensureUniqueCategorySlug(slug: string, excludeCategoryId?: string) {
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existing) return true
  if (excludeCategoryId && existing.id === excludeCategoryId) return true
  return false
}

function revalidateCategoryPaths() {
  revalidatePath("/")
  revalidatePath("/productos")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/products")
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return {
      error: getAuthorizationError(error) || "No autorizado para crear categorias.",
    }
  }

  const parsed = parseCategoryFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error }
  }

  const slug = parsed.data.slug || buildCategorySlug(parsed.data.name)
  const isUniqueSlug = await ensureUniqueCategorySlug(slug)
  if (!isUniqueSlug) {
    return { error: "Ya existe una categoria con ese slug." }
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ya existe una categoria con ese slug." }
    }
    throw error
  }

  revalidateCategoryPaths()
  redirect("/dashboard/categories")
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await requireAdmin()
  } catch (error) {
    return {
      error: getAuthorizationError(error) || "No autorizado para editar categorias.",
    }
  }

  const parsed = parseCategoryFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error }
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })

  if (!existingCategory) {
    return { error: "Categoria no encontrada." }
  }

  const slug = parsed.data.slug || buildCategorySlug(parsed.data.name)
  const isUniqueSlug = await ensureUniqueCategorySlug(slug, categoryId)
  if (!isUniqueSlug) {
    return { error: "Ya existe una categoria con ese slug." }
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: parsed.data.name,
        slug,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ya existe una categoria con ese slug." }
    }
    throw error
  }

  revalidateCategoryPaths()
  redirect("/dashboard/categories")
}

type DeleteCategoryActionResult = {
  error: string | null
}

export async function deleteCategoryAction(categoryId: string): Promise<DeleteCategoryActionResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: "No autorizado para eliminar categorias." }
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  if (!existingCategory) {
    return { error: "Categoria no encontrada." }
  }

  if (existingCategory._count.products > 0) {
    return {
      error: "No se puede eliminar la categoria porque tiene productos asociados.",
    }
  }

  await prisma.category.delete({
    where: { id: categoryId },
  })

  revalidateCategoryPaths()
  return { error: null }
}
