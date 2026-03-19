import type { Category } from "@prisma/client"

export type CategoryOption = {
  id: string
  label: string
  slug: string
}

function normalizeSlugFragment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildCategorySlug(name: string): string {
  const normalized = normalizeSlugFragment(name)
  return normalized || "categoria"
}

export function mapCategoriesToOptions(categories: Category[]): CategoryOption[] {
  return categories.map((category) => ({
    id: category.id,
    label: category.name,
    slug: category.slug,
  }))
}

export function mapActiveCategories(categories: Category[]): Category[] {
  return categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es"))
}
