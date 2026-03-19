"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef } from "react"

import { useCart } from "@/components/public/cart-provider"
import WholesaleMinimumStatus from "@/components/public/wholesale-minimum-status"
import { Button, Card, Container, Input, PageHeader, Section, Textarea } from "@/components/ui"
import { formatArsAmount } from "@/lib/currency"
import { hasReachedWholesaleMinimum, WHOLESALE_MINIMUM_ITEMS } from "@/lib/wholesale-order"
import { EMPTY_CHECKOUT_ACTION_STATE } from "@/types/order"

import { createOrderAction } from "./actions"

function getCheckoutErrorMessage(error: string) {
  if (error.includes("pedido minimo mayorista")) {
    return {
      title: "No se puede confirmar el pedido todavia",
      hint: `Necesitas al menos ${WHOLESALE_MINIMUM_ITEMS} unidades totales para continuar.`,
    }
  }

  if (error.includes("productos inactivos")) {
    return {
      title: "Hay productos no disponibles en tu carrito",
      hint: "Vuelve al carrito, revisa los items e intenta nuevamente.",
    }
  }

  if (error.includes("ya no existen")) {
    return {
      title: "Algunos productos cambiaron",
      hint: "Actualiza el carrito para continuar con un pedido valido.",
    }
  }

  if (error.includes("carrito") || error.includes("invalido")) {
    return {
      title: "No se pudo procesar el carrito",
      hint: "Regresa al carrito y vuelve a intentar.",
    }
  }

  return {
    title: "No se pudo confirmar el pedido",
    hint: "Revisa los datos e intenta nuevamente.",
  }
}

export default function CheckoutPageClient() {
  const router = useRouter()
  const { items, totalItems, estimatedSubtotal, hasHydrated, clearCart } = useCart()
  const [state, formAction, isPending] = useActionState(createOrderAction, EMPTY_CHECKOUT_ACTION_STATE)
  const clearedOrderRef = useRef<string | null>(null)

  useEffect(() => {
    if (!state.orderId) return
    if (clearedOrderRef.current === state.orderId) return

    clearCart()
    clearedOrderRef.current = state.orderId

    const tokenParam = state.confirmationToken
      ? `?token=${encodeURIComponent(state.confirmationToken)}`
      : ""
    router.push(`/checkout/confirmacion/${state.orderId}${tokenParam}`)
  }, [state.orderId, state.confirmationToken, clearCart, router])

  if (!hasHydrated) {
    return (
      <main className="py-8 md:py-10">
        <Container size="public">
          <Card className="p-6 text-sm text-[var(--color-muted)]">Cargando checkout...</Card>
        </Container>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="py-8 md:py-10">
        <Container size="public">
          <PageHeader title="Checkout" description="No hay items en el carrito para confirmar." />
          <Section compact>
            <Card className="p-6 text-sm text-[var(--color-muted)]">
              Agrega productos antes de completar tus datos.
              <div className="mt-4">
                <Link
                  href="/carrito"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
                >
                  Ir al carrito
                </Link>
              </div>
            </Card>
          </Section>
        </Container>
      </main>
    )
  }

  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  )
  const minimumReached = hasReachedWholesaleMinimum(totalItems)
  const errorDetails = state.error ? getCheckoutErrorMessage(state.error) : null

  return (
    <main className="py-8 md:py-10">
      <Container size="public">
        <PageHeader
          eyebrow="Pedido mayorista"
          title="Checkout"
          description={`Completa tus datos para confirmar el pedido. Minimo obligatorio: ${WHOLESALE_MINIMUM_ITEMS} unidades combinables.`}
        />

        <Section compact>
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Datos de contacto</h2>
              <WholesaleMinimumStatus totalItems={totalItems} className="mt-4" />
              {!minimumReached ? (
                <p className="mt-3 rounded-lg border border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.14)] px-3 py-2 text-xs font-medium text-[var(--color-text)]">
                  El checkout se habilita al alcanzar {WHOLESALE_MINIMUM_ITEMS} unidades totales.
                </p>
              ) : (
                <p className="mt-3 rounded-lg border border-[var(--color-success)]/45 bg-[rgba(22,128,59,0.18)] px-3 py-2 text-xs font-medium text-[var(--color-text)]">
                  Pedido habilitado para confirmacion.
                </p>
              )}
              <form action={formAction} className="mt-4 grid gap-3">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[var(--color-text)]">Nombre y apellido</span>
                  <Input type="text" name="customerName" placeholder="Nombre y apellido" maxLength={80} required />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[var(--color-text)]">Empresa (opcional)</span>
                  <Input type="text" name="company" placeholder="Empresa (opcional)" maxLength={120} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[var(--color-text)]">Telefono de contacto</span>
                  <Input type="text" name="phone" placeholder="Telefono de contacto" maxLength={30} required />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[var(--color-text)]">Email (opcional)</span>
                  <Input type="email" name="email" placeholder="Email (opcional)" maxLength={120} />
                </label>

                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <input type="hidden" name="items" value={itemsPayload} readOnly />

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[var(--color-text)]">Notas adicionales (opcional)</span>
                  <Textarea
                    name="notes"
                    placeholder="Horarios, frecuencia, observaciones"
                    rows={5}
                    maxLength={1500}
                  />
                </label>

                {state.error && errorDetails ? (
                  <div className="rounded-lg border border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.18)] p-3 text-sm text-[var(--color-text)]">
                    <p className="font-semibold">{errorDetails.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-text)]/90">{errorDetails.hint}</p>
                    <p className="mt-2 text-xs text-[var(--color-text)]/80">Detalle tecnico: {state.error}</p>
                  </div>
                ) : null}

                <Button type="submit" disabled={isPending || !minimumReached} fullWidth>
                  {isPending ? "Confirmando pedido..." : "Confirmar pedido"}
                </Button>
                {!minimumReached ? (
                  <p className="text-center text-xs text-[var(--color-muted)]">
                    Agrega mas unidades en tu carrito para habilitar este boton.
                  </p>
                ) : null}
              </form>
            </Card>

            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Resumen</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {items.length} {items.length === 1 ? "producto" : "productos"} distintos
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Unidades totales: <span className="font-semibold text-[var(--color-text)]">{totalItems}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Subtotal estimado: <span className="font-semibold text-[var(--color-text)]">{formatArsAmount(estimatedSubtotal)}</span>
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
                {items.map((item) => (
                  <li key={item.productId} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2">
                    <p className="font-medium text-[var(--color-text)]">{item.name}</p>
                    <p>
                      {item.presentation || "Sin presentacion"} - Cantidad: {item.quantity} - {formatArsAmount(item.quantity * item.unitPrice)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>
      </Container>
    </main>
  )
}
