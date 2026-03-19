import { OrderStatus } from "@prisma/client"

export const ORDER_STATUS_VALUES = [
  OrderStatus.PENDING,
  OrderStatus.CONTACTED,
  OrderStatus.DELIVERED,
] as const

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.includes(value as OrderStatus)
}

export function getOrderStatusLabel(status: OrderStatus): string {
  if (status === OrderStatus.PENDING) return "Pendiente"
  if (status === OrderStatus.CONTACTED) return "Contactado"
  return "Entregado"
}

export function getOrderStatusTone(status: OrderStatus): "pending" | "contacted" | "delivered" {
  if (status === OrderStatus.PENDING) return "pending"
  if (status === OrderStatus.CONTACTED) return "contacted"
  return "delivered"
}
