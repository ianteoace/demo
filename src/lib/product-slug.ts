import { prisma } from "@/lib/prisma"

function normalizeSlugFragment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildProductBaseSlug(name: string, brand?: string | null) {
  const base = [name, brand ?? ""]
    .map((value) => normalizeSlugFragment(value))
    .filter(Boolean)
    .join("-")

  return base || "producto"
}

export async function ensureUniqueProductSlug(baseSlug: string, excludeProductId?: string) {
  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })

    if (!existing || existing.id === excludeProductId) {
      return candidate
    }

    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}
