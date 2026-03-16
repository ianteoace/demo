import { prisma } from "@/lib/prisma"

function slugify(text: string) {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || "propiedad"
}

export function buildPropertyBaseSlug(title: string, city: string) {
  return slugify(`${title} ${city}`)
}

export async function ensureUniquePropertySlug(
  baseSlug: string,
  excludePropertyId?: string,
) {
  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const existing = await prisma.property.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })

    if (!existing || existing.id === excludePropertyId) {
      return candidate
    }

    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}
