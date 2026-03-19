import Link from "next/link"
import { notFound } from "next/navigation"

import { Card, Container, PageHeader, Section } from "@/components/ui"
import { getBusinessContact, getWhatsAppHref } from "@/lib/business-contact"
import { formatArsAmount } from "@/lib/currency"
import { prisma } from "@/lib/prisma"

type CheckoutConfirmationPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    token?: string
  }>
}

export default async function CheckoutConfirmationPage({
  params,
  searchParams,
}: CheckoutConfirmationPageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const token = resolvedSearchParams.token?.trim() || ""

  if (!token) {
    notFound()
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      publicToken: token,
    },
    include: {
      orderItems: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!order) {
    notFound()
  }

  const contact = getBusinessContact()
  const whatsappSummary = order.orderItems
    .map((item) => `- ${item.productNameSnapshot} x ${item.quantity} (${formatArsAmount(item.unitPriceSnapshot * item.quantity)})`)
    .join("\n")

  const whatsappHref = getWhatsAppHref(
    contact.whatsappNumber,
    `Hola! Confirmo el pedido ${order.id.slice(0, 8)}:\n${whatsappSummary}\nTotal estimado: ${formatArsAmount(order.totalAmountSnapshot)}`,
  )

  return (
    <main className="py-8 md:py-10">
      <Container size="public">
        <PageHeader
          eyebrow="Pedido registrado"
          title="Gracias por tu pedido"
          description="Recibimos tu pedido correctamente. El equipo comercial te contactara para validar entrega, tiempos y condiciones."
        />

        <Section compact>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Card className="p-5 md:p-6">
              <div className="mb-4 rounded-xl border border-[var(--color-success)]/45 bg-[rgba(22,128,59,0.2)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]">Pedido recibido</p>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  Numero de pedido{" "}
                  <span className="rounded-md bg-[var(--color-surface)] px-2 py-1 font-bold text-[var(--color-text)]">
                    #{order.id.slice(0, 8)}
                  </span>
                </p>
              </div>

              <h2 className="text-lg font-semibold text-[var(--color-text)]">Resumen del pedido</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Cliente: <span className="font-semibold text-[var(--color-text)]">{order.customerName}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Total estimado: <span className="font-semibold text-[var(--color-text)]">{formatArsAmount(order.totalAmountSnapshot)}</span>
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2">
                    <p className="font-medium text-[var(--color-text)]">{item.productNameSnapshot}</p>
                    <p>
                      {item.presentationSnapshot || "Sin presentacion"} - Cantidad: {item.quantity} - {formatArsAmount(item.unitPriceSnapshot * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Que pasa ahora</h2>
              <ol className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
                <li>1. Revisamos tu pedido y disponibilidad comercial.</li>
                <li>2. Te contactamos para confirmar entrega y condiciones.</li>
                <li>3. Coordinamos cierre operativo del pedido.</li>
              </ol>
              <p className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-xs text-[var(--color-muted)]">
                Guarda este enlace para volver a consultar la confirmacion.
              </p>
              <div className="mt-5 grid gap-2">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-success)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-success-hover)]"
                  >
                    Confirmar por WhatsApp
                  </a>
                ) : null}
                <Link
                  href="/productos"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                >
                  Volver a productos
                </Link>
              </div>
            </Card>
          </div>
        </Section>
      </Container>
    </main>
  )
}
