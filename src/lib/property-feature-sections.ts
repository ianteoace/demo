type RawFeature = {
  category: string
  key: string
  value: string
}

type StaticPropertyContext = {
  propertyTypeLabel: string
  operationTypeLabel: string
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  areaM2: number | null
  garage: boolean
}

export type PropertyFeatureSection = {
  id: string
  title: string
  items: Array<{
    label: string
    value: string
  }>
}

const SECTION_LABELS: Record<string, string> = {
  datos_basicos: "Datos básicos",
  caracteristicas: "Características",
  superficie: "Superficie",
  ambientes: "Ambientes",
  servicios: "Servicios",
  generales: "Generales",
}

const SECTION_ORDER = [
  "datos_basicos",
  "caracteristicas",
  "superficie",
  "ambientes",
  "servicios",
  "generales",
] as const

function toSentenceCaseLabel(raw: string) {
  const withSpaces = raw.replace(/[_-]+/g, " ").trim()
  if (!withSpaces) return ""
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

function normalizeCategory(rawCategory: string) {
  const normalized = rawCategory.trim().toLowerCase().replace(/\s+/g, "_")

  if (normalized === "instalaciones") {
    return "caracteristicas"
  }

  return SECTION_LABELS[normalized] ? normalized : "caracteristicas"
}

function pushItem(
  target: Map<string, Map<string, string>>,
  category: string,
  label: string,
  value: string,
) {
  const cleanedLabel = label.trim()
  const cleanedValue = value.trim()
  if (!cleanedLabel || !cleanedValue) return

  const sectionItems = target.get(category) ?? new Map<string, string>()
  if (!target.has(category)) {
    target.set(category, sectionItems)
  }

  if (!sectionItems.has(cleanedLabel)) {
    sectionItems.set(cleanedLabel, cleanedValue)
  }
}

export function buildPropertyFeatureSections(
  dynamicFeatures: RawFeature[],
  staticContext: StaticPropertyContext,
): PropertyFeatureSection[] {
  const sections = new Map<string, Map<string, string>>()

  pushItem(sections, "datos_basicos", "Tipo de propiedad", staticContext.propertyTypeLabel)
  pushItem(sections, "datos_basicos", "Tipo de operación", staticContext.operationTypeLabel)

  if (staticContext.areaM2 !== null) {
    pushItem(
      sections,
      "superficie",
      "Superficie total",
      `${staticContext.areaM2.toLocaleString("es-AR")} m²`,
    )
  }

  if (staticContext.rooms !== null) {
    pushItem(sections, "ambientes", "Cant. ambientes", String(staticContext.rooms))
  }
  if (staticContext.bedrooms !== null) {
    pushItem(sections, "ambientes", "Cant. dormitorios", String(staticContext.bedrooms))
  }
  if (staticContext.bathrooms !== null) {
    pushItem(sections, "ambientes", "Cant. baños", String(staticContext.bathrooms))
  }

  pushItem(sections, "caracteristicas", "Cochera", staticContext.garage ? "Sí" : "No")

  for (const feature of dynamicFeatures) {
    const category = normalizeCategory(feature.category)
    pushItem(sections, category, toSentenceCaseLabel(feature.key), feature.value)
  }

  const orderedSections: PropertyFeatureSection[] = []

  for (const categoryId of SECTION_ORDER) {
    const itemsMap = sections.get(categoryId)
    if (!itemsMap || itemsMap.size === 0) {
      continue
    }

    orderedSections.push({
      id: categoryId,
      title: SECTION_LABELS[categoryId],
      items: Array.from(itemsMap.entries()).map(([label, value]) => ({ label, value })),
    })
  }

  return orderedSections
}
