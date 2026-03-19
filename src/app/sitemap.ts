import type { MetadataRoute } from "next"

import { getAppUrl } from "@/lib/app-url"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getAppUrl()
  const now = new Date()
  const activeProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
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
      url: `${siteUrl}/productos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  const productRoutes: MetadataRoute.Sitemap = activeProducts.map((product) => ({
    url: `${siteUrl}/producto/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
