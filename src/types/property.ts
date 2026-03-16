import { Currency, OperationType, PropertyType } from "@prisma/client"
import type { Property, Prisma } from "@prisma/client"

import { isOperationType } from "@/lib/property-operation-type"
import { isCurrency } from "@/lib/property-price"
import { isPropertyType } from "@/lib/property-type"

export type PropertyWithImages = Prisma.PropertyGetPayload<{
  include: {
    images: true
  }
}>

export type PropertyFormValues = {
  title: string
  description: string
  price: string
  currency: Currency
  propertyType: PropertyType
  operationType: OperationType
  city: string
  address: string
  rooms: string
  bedrooms: string
  bathrooms: string
  areaM2: string
  garage: boolean
  featured: boolean
  published: boolean
}

export type PropertyActionState = {
  error: string | null
}

export const EMPTY_PROPERTY_ACTION_STATE: PropertyActionState = {
  error: null,
}

export const EMPTY_PROPERTY_FORM_VALUES: PropertyFormValues = {
  title: "",
  description: "",
  price: "",
  currency: Currency.USD,
  propertyType: PropertyType.APARTMENT,
  operationType: OperationType.SALE,
  city: "",
  address: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  areaM2: "",
  garage: false,
  featured: false,
  published: true,
}

export function toPropertyFormValues(property: Property): PropertyFormValues {
  return {
    title: property.title,
    description: property.description ?? "",
    price: String(property.price),
    currency: property.currency,
    propertyType: property.propertyType,
    operationType: property.operationType,
    city: property.city,
    address: property.address,
    rooms: property.rooms !== null ? String(property.rooms) : "",
    bedrooms: property.bedrooms !== null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms !== null ? String(property.bathrooms) : "",
    areaM2: property.areaM2 !== null ? String(property.areaM2) : "",
    garage: property.garage,
    featured: property.featured,
    published: property.published,
  }
}

type ParsedPropertyFormData = {
  title: string
  description: string | null
  price: number
  currency: Currency
  propertyType: PropertyType
  operationType: OperationType
  city: string
  address: string
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  areaM2: number | null
  garage: boolean
  featured: boolean
  published: boolean
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseOptionalInteger(value: string) {
  if (!value) {
    return { value: null } as const
  }

  if (!/^\d+$/.test(value)) {
    return { error: "Ambientes, dormitorios y baños deben ser números enteros." } as const
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return { error: "Ambientes, dormitorios y baños deben ser enteros >= 0." } as const
  }

  return { value: parsed } as const
}

type PropertyFormParseResult =
  | { data: ParsedPropertyFormData }
  | { error: string }

export function parsePropertyFormData(formData: FormData): PropertyFormParseResult {
  const title = getField(formData, "title")
  const descriptionRaw = getField(formData, "description")
  const priceRaw = getField(formData, "price")
  const currencyRaw = getField(formData, "currency")
  const propertyTypeRaw = getField(formData, "propertyType")
  const operationTypeRaw = getField(formData, "operationType")
  const city = getField(formData, "city")
  const address = getField(formData, "address")
  const roomsRaw = getField(formData, "rooms")
  const bedroomsRaw = getField(formData, "bedrooms")
  const bathroomsRaw = getField(formData, "bathrooms")
  const areaM2Raw = getField(formData, "areaM2")
  const garage = formData.get("garage") === "on"
  const featured = formData.get("featured") === "on"
  const published = formData.get("published") === "on"

  if (!title || !priceRaw || !city || !address) {
    return {
      error: "Título, precio, ciudad y dirección son obligatorios.",
    } as const
  }

  if (!isOperationType(operationTypeRaw)) {
    return {
      error: "Tipo de operación inválido.",
    } as const
  }

  if (!isCurrency(currencyRaw)) {
    return {
      error: "Moneda inválida.",
    } as const
  }

  if (!isPropertyType(propertyTypeRaw)) {
    return {
      error: "Tipo de propiedad inválido.",
    } as const
  }

  const price = Number(priceRaw)
  if (!Number.isInteger(price) || price < 0) {
    return {
      error: "El precio debe ser un número entero válido mayor o igual a 0.",
    } as const
  }

  const rooms = parseOptionalInteger(roomsRaw)
  if ("error" in rooms) {
    return { error: rooms.error ?? "Ambientes inválidos." }
  }

  const bedrooms = parseOptionalInteger(bedroomsRaw)
  if ("error" in bedrooms) {
    return { error: bedrooms.error ?? "Dormitorios inválidos." }
  }

  const bathrooms = parseOptionalInteger(bathroomsRaw)
  if ("error" in bathrooms) {
    return { error: bathrooms.error ?? "Baños inválidos." }
  }

  const areaM2 = parseOptionalInteger(areaM2Raw)
  if ("error" in areaM2) {
    return { error: areaM2.error ?? "Superficie inválida." }
  }

  const data: ParsedPropertyFormData = {
    title,
    description: descriptionRaw || null,
    price,
    currency: currencyRaw,
    propertyType: propertyTypeRaw,
    operationType: operationTypeRaw,
    city,
    address,
    rooms: rooms.value,
    bedrooms: bedrooms.value,
    bathrooms: bathrooms.value,
    areaM2: areaM2.value,
    garage,
    featured,
    published,
  }

  return { data }
}
