"use client"

import { useState } from "react"

import { useCart } from "./cart-provider"

type AddToCartButtonProps = {
  product: {
    id: string
    slug: string
    name: string
    brand: string | null
    presentation: string | null
    imageUrl: string | null
    unitPrice: number
  }
  quantity?: number
  className?: string
  compact?: boolean
  onAdded?: (quantity: number) => void
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className,
  compact = false,
  onAdded,
}: AddToCartButtonProps) {
  const { addItem, hasHydrated } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      presentation: product.presentation,
      imageUrl: product.imageUrl,
      unitPrice: product.unitPrice,
      quantity: normalizedQuantity,
    })

    onAdded?.(normalizedQuantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const defaultClassName = compact
    ? "inline-flex h-8 items-center justify-center rounded-full bg-[var(--color-primary)] px-3 text-[11px] font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
    : "inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-primary)] px-3.5 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!hasHydrated}
      className={`${className || defaultClassName} disabled:cursor-not-allowed disabled:opacity-70`}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      {!hasHydrated ? "Cargando..." : added ? "Agregado" : "Agregar"}
    </button>
  )
}
