import type { Prisma, Product } from "@prisma/client"

export type ProductWithCategoryAndImages = Prisma.ProductGetPayload<{
  include: {
    category: true
    images: true
  }
}>

export type ProductFormValues = {
  name: string
  slug: string
  shortDescription: string
  description: string
  brand: string
  presentation: string
  unitPrice: string
  isOnSale: boolean
  isFeatured: boolean
  isActive: boolean
  sortOrder: string
  categoryId: string
}

export type ProductActionState = {
  error: string | null
}

export type InquiryFormValues = {
  name: string
  company: string
  phone: string
  email: string
  message: string
  productId: string
}

export type InquiryActionState = {
  error: string | null
  success: string | null
}

export const EMPTY_INQUIRY_ACTION_STATE: InquiryActionState = {
  error: null,
  success: null,
}

export const EMPTY_PRODUCT_ACTION_STATE: ProductActionState = {
  error: null,
}

export const EMPTY_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  brand: "",
  presentation: "",
  unitPrice: "0",
  isOnSale: false,
  isFeatured: false,
  isActive: true,
  sortOrder: "0",
  categoryId: "",
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    brand: product.brand ?? "",
    presentation: product.presentation ?? "",
    unitPrice: String(product.unitPrice),
    isOnSale: product.isOnSale,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    sortOrder: String(product.sortOrder),
    categoryId: product.categoryId,
  }
}

type ParsedProductFormData = {
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  brand: string | null
  presentation: string | null
  unitPrice: number
  isOnSale: boolean
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  categoryId: string
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function normalizeOptional(value: string) {
  return value ? value : null
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

type ProductFormParseResult =
  | { data: ParsedProductFormData }
  | { error: string }

export function parseProductFormData(formData: FormData): ProductFormParseResult {
  const name = getField(formData, "name")
  const slug = getField(formData, "slug").toLowerCase()
  const shortDescription = getField(formData, "shortDescription")
  const description = getField(formData, "description")
  const brand = getField(formData, "brand")
  const presentation = getField(formData, "presentation")
  const unitPriceRaw = getField(formData, "unitPrice")
  const sortOrderRaw = getField(formData, "sortOrder")
  const categoryId = getField(formData, "categoryId")
  const isOnSale = formData.get("isOnSale") === "on"
  const isFeatured = formData.get("isFeatured") === "on"
  const isActive = formData.get("isActive") === "on"

  if (!name) {
    return { error: "El nombre del producto es obligatorio." }
  }

  if (!categoryId) {
    return { error: "Debes seleccionar una categoria." }
  }

  if (slug && !isValidSlug(slug)) {
    return { error: "El slug solo puede contener letras minusculas, numeros y guiones." }
  }

  const parsedSortOrder = Number(sortOrderRaw || "0")
  if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
    return { error: "El orden debe ser un numero entero mayor o igual a 0." }
  }

  const parsedUnitPrice = Number(unitPriceRaw || "0")
  if (!Number.isInteger(parsedUnitPrice) || parsedUnitPrice < 0) {
    return { error: "El precio unitario debe ser un numero entero mayor o igual a 0." }
  }

  return {
    data: {
      name,
      slug,
      shortDescription: normalizeOptional(shortDescription),
      description: normalizeOptional(description),
      brand: normalizeOptional(brand),
      presentation: normalizeOptional(presentation),
      unitPrice: parsedUnitPrice,
      isOnSale,
      isFeatured,
      isActive,
      sortOrder: parsedSortOrder,
      categoryId,
    },
  }
}
