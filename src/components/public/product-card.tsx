"use client"

import { useState } from "react"
import Link from "next/link"

import { Card } from "@/components/ui"
import { getWhatsAppHref } from "@/lib/business-contact"
import { formatArsAmount } from "@/lib/currency"
import AddToCartButton from "./add-to-cart-button"

type ProductCardProps = {
  product: {
    id: string
    slug: string
    name: string
    brand: string | null
    presentation: string | null
    unitPrice: number
    isOnSale: boolean
    category: {
      name: string
    }
    images: Array<{
      url: string
      alt: string | null
    }>
  }
  whatsappNumber: string | null
  dense?: boolean
}

export default function ProductCard({ product, whatsappNumber, dense = false }: ProductCardProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null)

  const image = product.images[0]
  const isNatura = Boolean(product.brand && /natura/i.test(product.brand))
  const whatsappHref = getWhatsAppHref(
    whatsappNumber,
    `Hola! Quiero consultar por el producto ${product.name}.`,
  )

  function increaseQuantity() {
    setSelectedQuantity((previous) => Math.min(1000, previous + 1))
  }

  function decreaseQuantity() {
    setSelectedQuantity((previous) => Math.max(1, previous - 1))
  }

  function handleAdded(quantity: number) {
    setAddedFeedback(`Se agregaron ${quantity} ${quantity === 1 ? "unidad" : "unidades"} al carrito.`)
    setTimeout(() => setAddedFeedback(null), 1600)
  }

  return (
    <Card className="group overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3a3d44] hover:shadow-[0_12px_28px_rgba(0,0,0,0.3)]">
      <Link
        href={`/producto/${product.slug}`}
        aria-label={`Ver detalle de ${product.name}`}
        className={
          dense
            ? "relative block aspect-square w-full cursor-pointer bg-[#101116]"
            : "relative block h-48 w-full cursor-pointer bg-[#101116]"
        }
      >
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[var(--color-muted)]">
            Sin imagen
          </div>
        )}
        {product.isOnSale ? (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
            Oferta activa
          </span>
        ) : null}
        {isNatura ? (
          <span className={`absolute top-2 rounded-full border border-[var(--color-border)] bg-[#1f2128] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text)] ${product.isOnSale ? "left-20" : "left-2"}`}>
            Natura
          </span>
        ) : null}
      </Link>

      <div className={dense ? "grid gap-1.5 p-2" : "grid gap-1.5 p-3.5"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {product.category.name}
        </p>
        <p className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">
          Mayorista - Minimo 50 unidades
        </p>
        <h3 className={dense ? "line-clamp-2 text-[15px] font-semibold leading-tight text-[var(--color-text)]" : "text-base font-semibold leading-tight text-[var(--color-text)]"}>
          {product.name}
        </h3>
        <p className="text-xs text-[var(--color-muted)]">
          {product.brand || "Marca no especificada"}
        </p>
        <p className="text-xs font-medium text-[var(--color-text)]">
          Presentacion: <span className="font-semibold">{product.presentation || "No especificada"}</span>
        </p>
        <div className="mt-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Precio estimado</p>
          <p className={dense ? "text-base font-bold text-[var(--color-text)]" : "text-lg font-bold text-[var(--color-text)]"}>
            {formatArsAmount(product.unitPrice)}
            <span className="ml-1 text-xs font-medium text-[var(--color-muted)]">c/u</span>
          </p>
        </div>

        <div className={dense ? "mt-1.5 flex flex-wrap gap-1.5" : "mt-2 flex flex-wrap gap-2"}>
          <div className={dense ? "inline-flex h-8 items-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)]" : "inline-flex h-9 items-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)]"}>
            <button
              type="button"
              onClick={decreaseQuantity}
              className={dense ? "inline-flex h-8 w-8 items-center justify-center text-xs font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]" : "inline-flex h-9 w-9 items-center justify-center text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"}
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className={dense ? "inline-flex min-w-7 items-center justify-center px-1 text-[11px] font-semibold text-[var(--color-text)]" : "inline-flex min-w-8 items-center justify-center px-1 text-xs font-semibold text-[var(--color-text)]"}>
              {selectedQuantity}
            </span>
            <button
              type="button"
              onClick={increaseQuantity}
              className={dense ? "inline-flex h-8 w-8 items-center justify-center text-xs font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]" : "inline-flex h-9 w-9 items-center justify-center text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              presentation: product.presentation,
              imageUrl: image?.url || null,
              unitPrice: product.unitPrice,
            }}
            quantity={selectedQuantity}
            onAdded={handleAdded}
            compact={dense}
          />
          <Link
            href={`/producto/${product.slug}`}
            className={dense
              ? "inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-[11px] font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              : "inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"}
          >
            Ver producto
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={dense
                ? "inline-flex h-8 items-center justify-center rounded-full border border-[#1f6f38] bg-[#133821] px-3 text-[11px] font-semibold text-[#9ae3b4] transition hover:bg-[#194a2b]"
                : "inline-flex h-9 items-center justify-center rounded-full border border-[#1f6f38] bg-[#133821] px-3.5 text-xs font-semibold text-[#9ae3b4] transition hover:bg-[#194a2b]"}
            >
              Consultar
            </a>
          ) : null}
        </div>

        {addedFeedback ? (
          <p className="mt-1 text-xs font-medium text-[var(--color-success)]">{addedFeedback}</p>
        ) : null}
      </div>
    </Card>
  )
}
