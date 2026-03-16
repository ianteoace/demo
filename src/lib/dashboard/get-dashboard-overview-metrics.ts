import { prisma } from "@/lib/prisma"

export type DashboardOverviewMetrics = {
  totalProperties: number
  publishedProperties: number
  featuredProperties: number
  draftProperties: number
  totalLeads: number
  recentLeads: number
}

export async function getDashboardOverviewMetrics(): Promise<DashboardOverviewMetrics> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    totalProperties,
    publishedProperties,
    featuredProperties,
    draftProperties,
    totalLeads,
    recentLeads,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { published: true } }),
    prisma.property.count({ where: { featured: true } }),
    prisma.property.count({ where: { published: false } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ])

  return {
    totalProperties,
    publishedProperties,
    featuredProperties,
    draftProperties,
    totalLeads,
    recentLeads,
  }
}
