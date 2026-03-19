"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { toggleProductActiveAction } from "./actions"

type ActiveToggleButtonProps = {
  productId: string
  isActive: boolean
}

export default function ActiveToggleButton({ productId, isActive }: ActiveToggleButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleProductActiveAction(productId, !isActive)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? "border-[var(--color-success)]/55 bg-[rgba(22,128,59,0.2)] text-[var(--color-text)] hover:bg-[rgba(22,128,59,0.3)]"
          : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[#3a3d44] hover:text-white"
      }`}
    >
      {isPending ? "Guardando..." : isActive ? "Desactivar" : "Reactivar"}
    </button>
  )
}
