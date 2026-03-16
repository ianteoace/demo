import type { MetadataRoute } from "next"

import { getAppUrl } from "@/lib/app-url"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getAppUrl()
  const now = new Date()

  const publishedProperties = await prisma.property.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/propiedades`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  const propertyRoutes: MetadataRoute.Sitemap = publishedProperties.map((property) => ({
    url: `${siteUrl}/propiedad/${property.slug}`,
    lastModified: property.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...propertyRoutes]
}
