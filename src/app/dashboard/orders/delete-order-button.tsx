"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { deleteOrderAction } from "./actions"

type DeleteOrderButtonProps = {
  orderId: string
  orderLabel: string
  compact?: boolean
}

export default function DeleteOrderButton({
  orderId,
  orderLabel,
  compact = false,
}: DeleteOrderButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    const confirmed = window.confirm(
      `Vas a eliminar el pedido ${orderLabel}. Esta accion no se puede deshacer.`,
    )
    if (!confirmed) return

    setError(null)
    startTransition(async () => {
      const result = await deleteOrderAction(orderId)
      if (result.error) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={`inline-flex items-center justify-center rounded-full border border-[var(--color-primary)]/45 bg-[rgba(225,6,0,0.18)] font-semibold text-[var(--color-text)] transition hover:bg-[rgba(225,6,0,0.28)] disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm"
        }`}
      >
        {isPending ? "Eliminando..." : "Eliminar"}
      </button>
      {error ? (
        <p className="rounded-md border border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.14)] px-2 py-1 text-xs text-[var(--color-text)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
