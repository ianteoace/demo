import { prisma } from "@/lib/prisma"

export type DashboardOverviewMetrics = {
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalAmountSnapshot: number
}

export async function getDashboardOverviewMetrics(): Promise<DashboardOverviewMetrics> {
  const [
    activeProducts,
    totalOrders,
    pendingOrders,
    ordersAmountAggregation,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: {
        totalAmountSnapshot: true,
      },
    }),
  ])

  return {
    activeProducts,
    totalOrders,
    pendingOrders,
    totalAmountSnapshot: ordersAmountAggregation._sum.totalAmountSnapshot ?? 0,
  }
}
