import { PropertyType } from "@prisma/client"

export const PROPERTY_TYPE_VALUES = [
  PropertyType.APARTMENT,
  PropertyType.HOUSE,
  PropertyType.PH,
  PropertyType.LAND,
  PropertyType.COMMERCIAL,
  PropertyType.OFFICE,
] as const

export function isPropertyType(value: string): value is PropertyType {
  return PROPERTY_TYPE_VALUES.includes(value as PropertyType)
}

export function getPropertyTypeLabel(propertyType: PropertyType): string {
  if (propertyType === PropertyType.APARTMENT) return "Departamento"
  if (propertyType === PropertyType.HOUSE) return "Casa"
  if (propertyType === PropertyType.PH) return "PH"
  if (propertyType === PropertyType.LAND) return "Terreno"
  if (propertyType === PropertyType.COMMERCIAL) return "Local"
  return "Oficina"
}
