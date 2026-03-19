"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useCart } from "@/components/public/cart-provider"
import WholesaleMinimumStatus from "@/components/public/wholesale-minimum-status"
import { Button, Card, Container, PageHeader, Section } from "@/components/ui"
import { formatArsAmount } from "@/lib/currency"
import { hasReachedWholesaleMinimum, WHOLESALE_MINIMUM_ITEMS } from "@/lib/wholesale-order"

export default function CartPageClient() {
  const { items, totalItems, estimatedSubtotal, updateQuantity, removeItem, hasHydrated } = useCart()
  const [cartFeedback, setCartFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!cartFeedback) return
    const timeout = window.setTimeout(() => setCartFeedback(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [cartFeedback])

  if (!hasHydrated) {
    return (
      <main className="py-8 md:py-10">
        <Container size="public">
          <Card className="p-6 text-sm text-[var(--color-muted)]">Cargando carrito...</Card>
        </Container>
      </main>
    )
  }

  const isEmpty = items.length === 0
  const minimumReached = hasReachedWholesaleMinimum(totalItems)

  return (
    <main className="py-8 md:py-10">
      <Container size="public">
        <PageHeader
          eyebrow="Compra mayorista"
          title="Carrito"
          description={`Pedido minimo obligatorio: ${WHOLESALE_MINIMUM_ITEMS} unidades totales combinables.`}
        />

        <Section compact>
          {isEmpty ? (
            <Card className="p-6">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Tu carrito esta vacio.
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Explora el catalogo, combina productos y llega al minimo mayorista para habilitar checkout.
              </p>
              <div className="mt-4">
                <Link
                  href="/productos"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
                >
                  Explorar productos
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <Card className="overflow-hidden p-0">
                {cartFeedback ? (
                  <div className="border-b border-[var(--color-border)] bg-[rgba(22,128,59,0.18)] px-4 py-2 text-xs font-medium text-[var(--color-text)]">
                    {cartFeedback}
                  </div>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--color-border)]">
                    <thead className="bg-[var(--color-surface-soft)]">
                      <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                        <th className="px-4 py-3 font-semibold">Producto</th>
                        <th className="px-4 py-3 font-semibold">Presentacion</th>
                        <th className="px-4 py-3 font-semibold">Precio unit.</th>
                        <th className="px-4 py-3 font-semibold">Cantidad</th>
                        <th className="px-4 py-3 font-semibold">Subtotal</th>
                        <th className="px-4 py-3 font-semibold">Accion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                      {items.map((item) => (
                        <tr key={item.productId} className="align-top">
                          <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">
                            <Link href={`/producto/${item.slug}`} className="underline-offset-2 hover:underline">
                              {item.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{item.presentation || "-"}</td>
                          <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{formatArsAmount(item.unitPrice)}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={item.quantity}
                              onChange={(event) => {
                                const nextQuantity = Number(event.target.value) || 1
                                updateQuantity(item.productId, nextQuantity)
                                setCartFeedback(`Cantidad actualizada: ${item.name} x${Math.max(1, Math.floor(nextQuantity))}.`)
                              }}
                              className="h-9 w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[#3a3d44] focus:ring-2 focus:ring-[rgba(225,6,0,0.22)]"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{formatArsAmount(item.quantity * item.unitPrice)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.productId)
                                setCartFeedback(`${item.name} fue quitado del carrito.`)
                              }}
                              className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Resumen</h2>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  Productos distintos: {items.length}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Unidades totales: <span className="font-semibold text-[var(--color-text)]">{totalItems}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Subtotal estimado: <span className="font-semibold text-[var(--color-text)]">{formatArsAmount(estimatedSubtotal)}</span>
                </p>
                <WholesaleMinimumStatus totalItems={totalItems} className="mt-2" />
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  En checkout te pediremos datos de contacto para enviar el pedido comercial.
                </p>
                {!minimumReached ? (
                  <p className="mt-2 rounded-lg border border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.14)] px-3 py-2 text-xs font-medium text-[var(--color-text)]">
                    Aun no llegas al minimo mayorista. Agrega mas unidades para continuar.
                  </p>
                ) : null}
                <div className="mt-4 grid gap-2">
                  {minimumReached ? (
                    <Link href="/checkout">
                      <Button fullWidth>Continuar al checkout</Button>
                    </Link>
                  ) : (
                    <Button fullWidth disabled>
                      Continuar al checkout
                    </Button>
                  )}
                  <Link
                    href="/productos"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </Section>
      </Container>
    </main>
  )
}
