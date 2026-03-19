"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import AddToCartButton from "@/components/public/add-to-cart-button"
import { formatArsAmount } from "@/lib/currency"

type ProductCartPanelProps = {
  product: {
    id: string
    slug: string
    name: string
    brand: string | null
    presentation: string | null
    imageUrl: string | null
    unitPrice: number
  }
}

export default function ProductCartPanel({ product }: ProductCartPanelProps) {
  const [quantityInput, setQuantityInput] = useState("1")

  const normalizedQuantity = useMemo(() => {
    if (!quantityInput.trim()) return 1
    const parsed = Number(quantityInput)
    if (!Number.isFinite(parsed)) return 1
    const floored = Math.floor(parsed)
    if (floored < 1) return 1
    if (floored > 1000) return 1000
    return floored
  }, [quantityInput])

  function normalizeInputOnBlur() {
    if (!quantityInput.trim()) {
      setQuantityInput("1")
      return
    }

    const parsed = Number(quantityInput)
    if (!Number.isFinite(parsed)) {
      setQuantityInput("1")
      return
    }

    const floored = Math.floor(parsed)
    if (floored < 1) {
      setQuantityInput("1")
      return
    }

    if (floored > 1000) {
      setQuantityInput("1000")
      return
    }

    setQuantityInput(String(floored))
  }

  return (
    <div className="mt-4 grid gap-2">
      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        Cantidad (precio estimado: {formatArsAmount(product.unitPrice)} c/u)
        <input
          type="number"
          min={1}
          max={1000}
          value={quantityInput}
          onChange={(event) => {
            const nextValue = event.target.value

            if (nextValue === "") {
              setQuantityInput("")
              return
            }

            if (!/^\d+$/.test(nextValue)) {
              return
            }

            setQuantityInput(nextValue)
          }}
          onBlur={normalizeInputOnBlur}
          className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[#3a3d44]"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <AddToCartButton
          product={product}
          quantity={normalizedQuantity}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        />
        <Link
          href="/carrito"
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
        >
          Ver carrito
        </Link>
      </div>
    </div>
  )
}
