import { InquiryStatus } from "@prisma/client"

import { getInquiryStatusLabel, getInquiryStatusTone } from "@/lib/inquiry-status"

import InquiryStatusSelect from "./inquiry-status-select"

type InquiryRow = {
  id: string
  name: string
  company: string | null
  phone: string
  email: string | null
  productName: string | null
  status: InquiryStatus
  createdAt: Date
}

type InquiriesTableProps = {
  inquiries: InquiryRow[]
}

function StatusChip({ status }: { status: InquiryStatus }) {
  const tone = getInquiryStatusTone(status)
  const toneClass =
    tone === "new"
      ? "bg-[rgba(225,6,0,0.18)] text-[var(--color-text)] ring-[rgba(225,6,0,0.35)]"
      : tone === "contacted"
        ? "bg-[var(--color-surface-soft)] text-[var(--color-text)] ring-[var(--color-border)]"
        : "bg-[rgba(22,128,59,0.22)] text-[var(--color-text)] ring-[rgba(22,128,59,0.4)]"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClass}`}>
      {getInquiryStatusLabel(status)}
    </span>
  )
}

export default function InquiriesTable({ inquiries }: InquiriesTableProps) {
  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="min-w-full divide-y divide-[var(--color-border)]">
        <thead className="bg-[var(--color-surface-soft)]">
          <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Empresa</th>
            <th className="px-4 py-3 font-semibold">Telefono</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Producto</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Actualizar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="align-top">
              <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{inquiry.name}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{inquiry.company || "-"}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{inquiry.phone}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                {inquiry.email ? (
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-[var(--color-muted)] underline-offset-2 transition hover:text-[var(--color-text)] hover:underline"
                  >
                    {inquiry.email}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{inquiry.productName || "Sin producto asociado"}</td>
              <td className="px-4 py-3">
                <StatusChip status={inquiry.status} />
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{dateFormatter.format(inquiry.createdAt)}</td>
              <td className="px-4 py-3">
                <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
