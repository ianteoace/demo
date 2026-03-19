import { OrderStatus } from "@prisma/client"
import Link from "next/link"

import { getWhatsAppHref } from "@/lib/business-contact"
import { formatArsAmount } from "@/lib/currency"
import { getOrderStatusLabel, getOrderStatusTone } from "@/lib/order-status"

import DeleteOrderButton from "./delete-order-button"
import OrderStatusSelect from "./order-status-select"

type OrderRow = {
  id: string
  customerName: string
  company: string | null
  phone: string
  totalItems: number
  totalAmountSnapshot: number
  status: OrderStatus
  createdAt: Date
}

type OrdersTableProps = {
  orders: OrderRow[]
}

function toWhatsAppNumberFromPhone(phone: string): string | null {
  const digits = phone.replace(/\D+/g, "")
  if (!digits) return null
  return digits
}

function StatusChip({ status }: { status: OrderStatus }) {
  const tone = getOrderStatusTone(status)
  const toneClass =
    tone === "pending"
      ? "bg-[rgba(225,6,0,0.18)] text-[var(--color-text)] ring-[rgba(225,6,0,0.35)]"
      : tone === "contacted"
        ? "bg-[var(--color-surface-soft)] text-[var(--color-text)] ring-[var(--color-border)]"
        : "bg-[rgba(22,128,59,0.22)] text-[var(--color-text)] ring-[rgba(22,128,59,0.4)]"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClass}`}>
      {getOrderStatusLabel(status)}
    </span>
  )
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-2 text-xs text-[var(--color-muted)] md:hidden">
        Vista compacta para mobile. Abre cada pedido para ver detalle completo.
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {orders.map((order) => {
          const whatsappNumber = toWhatsAppNumberFromPhone(order.phone)
          const whatsappHref = getWhatsAppHref(
            whatsappNumber,
            `Hola ${order.customerName}, te contactamos por tu pedido ${order.id.slice(0, 8)}.`,
          )

          return (
            <article key={order.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-sm font-semibold text-[var(--color-text)] underline-offset-2 hover:underline"
                  >
                    Pedido #{order.id.slice(0, 8)}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">{dateFormatter.format(order.createdAt)}</p>
                </div>
                <StatusChip status={order.status} />
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-[var(--color-muted)]">Cliente</dt>
                  <dd className="font-medium text-[var(--color-text)]">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Telefono</dt>
                  <dd className="font-medium text-[var(--color-text)]">{order.phone}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Unidades</dt>
                  <dd className="font-medium text-[var(--color-text)]">{order.totalItems}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Total</dt>
                  <dd className="font-medium text-[var(--color-text)]">{formatArsAmount(order.totalAmountSnapshot)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <OrderStatusSelect orderId={order.id} status={order.status} />
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                >
                  Ver detalle
                </Link>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-success)] bg-[rgba(22,128,59,0.2)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[rgba(22,128,59,0.3)]"
                  >
                    WhatsApp
                  </a>
                ) : null}
                <DeleteOrderButton orderId={order.id} orderLabel={`#${order.id.slice(0, 8)}`} compact />
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-surface-soft)]">
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3 font-semibold">Pedido</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Telefono</th>
              <th className="px-4 py-3 font-semibold">Unidades</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {orders.map((order) => {
              const whatsappNumber = toWhatsAppNumberFromPhone(order.phone)
              const whatsappHref = getWhatsAppHref(
                whatsappNumber,
                `Hola ${order.customerName}, te contactamos por tu pedido ${order.id.slice(0, 8)}.`,
              )

              return (
                <tr key={order.id} className="align-top">
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium text-[var(--color-text)] underline-offset-2 hover:underline"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{order.customerName}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{order.company || "-"}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{order.phone}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{order.totalItems}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{formatArsAmount(order.totalAmountSnapshot)}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{dateFormatter.format(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                      {whatsappHref ? (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-success)] bg-[rgba(22,128,59,0.2)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[rgba(22,128,59,0.3)]"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                      <DeleteOrderButton orderId={order.id} orderLabel={`#${order.id.slice(0, 8)}`} compact />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
