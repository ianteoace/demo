export type PropertyFeaturesData = {
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  areaM2: number | null
  garage: boolean
}

export function getPropertyFeatureSummary(features: PropertyFeaturesData): string[] {
  const items: string[] = []

  if (features.rooms !== null) {
    items.push(`${features.rooms} amb.`)
  }

  if (features.bedrooms !== null) {
    items.push(`${features.bedrooms} dorm.`)
  }

  if (features.bathrooms !== null) {
    items.push(features.bathrooms === 1 ? "1 baño" : `${features.bathrooms} baños`)
  }

  if (features.areaM2 !== null) {
    items.push(`${features.areaM2.toLocaleString("es-AR")} m²`)
  }

  if (features.garage) {
    items.push("Cochera")
  }

  return items
}
