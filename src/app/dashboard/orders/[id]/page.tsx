import Link from "next/link"
import { notFound } from "next/navigation"

import { Card, Container, PageHeader, Section } from "@/components/ui"
import { getWhatsAppHref } from "@/lib/business-contact"
import { formatArsAmount } from "@/lib/currency"
import { getOrderStatusLabel } from "@/lib/order-status"
import { prisma } from "@/lib/prisma"

import DeleteOrderButton from "../delete-order-button"
import OrderStatusSelect from "../order-status-select"

type OrderDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

function toWhatsAppNumberFromPhone(phone: string): string | null {
  const digits = phone.replace(/\D+/g, "")
  if (!digits) return null
  return digits
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!order) {
    notFound()
  }

  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const whatsappHref = getWhatsAppHref(
    toWhatsAppNumberFromPhone(order.phone),
    `Hola ${order.customerName}, te contactamos por tu pedido ${order.id.slice(0, 8)}.`,
  )

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          eyebrow="Pedido mayorista"
          title={`Pedido ${order.id.slice(0, 8)}`}
          description={`Creado el ${dateFormatter.format(order.createdAt)}.`}
          actions={
            <Link
              href="/dashboard/orders"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
            >
              Volver a pedidos
            </Link>
          }
        />

        <Section compact>
          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Datos de contacto</h2>
              <dl className="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
                <div>
                  <dt className="font-medium text-[var(--color-text)]">Cliente</dt>
                  <dd>{order.customerName}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--color-text)]">Empresa</dt>
                  <dd>{order.company || "-"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--color-text)]">Telefono</dt>
                  <dd>{order.phone}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--color-text)]">Email</dt>
                  <dd>
                    {order.email ? (
                      <a href={`mailto:${order.email}`} className="underline-offset-2 hover:underline">
                        {order.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--color-text)]">Notas</dt>
                  <dd className="whitespace-pre-wrap">{order.notes || "-"}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Estado del pedido</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Estado actual: <span className="font-semibold text-[var(--color-text)]">{getOrderStatusLabel(order.status)}</span>
              </p>
              <div className="mt-4">
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>
              <p className="mt-4 text-sm text-[var(--color-muted)]">
                Total de unidades: <span className="font-semibold text-[var(--color-text)]">{order.totalItems}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Total estimado: <span className="font-semibold text-[var(--color-text)]">{formatArsAmount(order.totalAmountSnapshot)}</span>
              </p>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-success)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-success-hover)]"
                >
                  Contactar por WhatsApp
                </a>
              ) : null}
              <div className="mt-2">
                <DeleteOrderButton orderId={order.id} orderLabel={`#${order.id.slice(0, 8)}`} />
              </div>
            </Card>
          </div>
        </Section>

        <Section compact title="Items del pedido" description="Snapshots capturados al confirmar checkout.">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-2 p-3 md:hidden">
              {order.orderItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
                  <p className="text-sm font-medium text-[var(--color-text)]">{item.productNameSnapshot}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{item.presentationSnapshot || "Sin presentacion"}</p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-[var(--color-muted)]">Precio</dt>
                      <dd className="font-medium text-[var(--color-text)]">{formatArsAmount(item.unitPriceSnapshot)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted)]">Cantidad</dt>
                      <dd className="font-medium text-[var(--color-text)]">{item.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted)]">Subtotal</dt>
                      <dd className="font-medium text-[var(--color-text)]">{formatArsAmount(item.quantity * item.unitPriceSnapshot)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-[var(--color-border)]">
                <thead className="bg-[var(--color-surface-soft)]">
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    <th className="px-4 py-3 font-semibold">Producto</th>
                    <th className="px-4 py-3 font-semibold">Presentacion</th>
                    <th className="px-4 py-3 font-semibold">Precio unitario</th>
                    <th className="px-4 py-3 font-semibold">Cantidad</th>
                    <th className="px-4 py-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{item.productNameSnapshot}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{item.presentationSnapshot || "-"}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{formatArsAmount(item.unitPriceSnapshot)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{formatArsAmount(item.quantity * item.unitPriceSnapshot)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      </Container>
    </main>
  )
}
