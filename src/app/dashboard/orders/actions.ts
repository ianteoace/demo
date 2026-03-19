"use server"

import { revalidatePath } from "next/cache"

import { logAppError, logBusinessEvent } from "@/lib/observability"
import { isOrderStatus } from "@/lib/order-status"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  try {
    const session = await requireAdmin()

    const statusValue = formData.get("status")
    const status = typeof statusValue === "string" ? statusValue : ""

    if (!isOrderStatus(status)) {
      return
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    })

    if (!existingOrder) {
      return
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    logBusinessEvent("order.status_changed", {
      actorEmail: session.user.email,
      orderId,
      fromStatus: existingOrder.status,
      toStatus: status,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/orders")
    revalidatePath(`/dashboard/orders/${orderId}`)
  } catch (error) {
    logAppError("orders.update_status", error, { orderId })
    throw error
  }
}

export async function deleteOrderAction(orderId: string): Promise<{ error: string | null }> {
  try {
    const session = await requireAdmin()

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    })

    if (!existingOrder) {
      return { error: "Pedido no encontrado." }
    }

    await prisma.order.delete({
      where: { id: orderId },
    })

    logBusinessEvent("order.deleted", {
      actorEmail: session.user.email,
      orderId,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/orders")
    revalidatePath(`/dashboard/orders/${orderId}`)

    return { error: null }
  } catch (error) {
    logAppError("orders.delete", error, { orderId })
    return { error: "No se pudo eliminar el pedido." }
  }
}
