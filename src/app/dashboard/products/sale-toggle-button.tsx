"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { toggleProductOnSaleAction } from "./actions"

type SaleToggleButtonProps = {
  productId: string
  isOnSale: boolean
}

export default function SaleToggleButton({ productId, isOnSale }: SaleToggleButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleProductOnSaleAction(productId, !isOnSale)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isOnSale
          ? "border-[var(--color-primary)]/45 bg-[rgba(225,6,0,0.18)] text-[var(--color-text)] hover:bg-[rgba(225,6,0,0.26)]"
          : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[#3a3d44] hover:text-white"
      }`}
    >
      {isPending ? "Guardando..." : isOnSale ? "Quitar oferta" : "Publicar oferta"}
    </button>
  )
}
