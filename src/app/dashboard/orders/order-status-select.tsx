"use client"

import { OrderStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { getOrderStatusLabel, ORDER_STATUS_VALUES } from "@/lib/order-status"

import { updateOrderStatusAction } from "./actions"

type OrderStatusSelectProps = {
  orderId: string
  status: OrderStatus
}

export default function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSelectedStatus(status)
  }, [status])

  async function handleStatusChange(nextStatus: OrderStatus) {
    const previousStatus = selectedStatus
    setSelectedStatus(nextStatus)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set("status", nextStatus)
        await updateOrderStatusAction(orderId, formData)
        router.refresh()
      } catch {
        setSelectedStatus(previousStatus)
      }
    })
  }

  return (
    <select
      name="status"
      value={selectedStatus}
      disabled={isPending}
      onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
      className="h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-text)] outline-none transition focus:border-[#3a3d44] focus:ring-2 focus:ring-[rgba(225,6,0,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
      aria-label="Cambiar estado del pedido"
    >
      {ORDER_STATUS_VALUES.map((value) => (
        <option key={value} value={value}>
          {getOrderStatusLabel(value)}
        </option>
      ))}
    </select>
  )
}
