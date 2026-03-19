import Link from "next/link"

import { Card } from "@/components/ui"
import { formatArsAmount } from "@/lib/currency"

import ActiveToggleButton from "./active-toggle-button"
import SaleToggleButton from "./sale-toggle-button"

type ProductRow = {
  id: string
  name: string
  categoryName: string
  brand: string | null
  presentation: string | null
  unitPrice: number
  isOnSale: boolean
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  imagesCount: number
}

type ProductsTableProps = {
  products: ProductRow[]
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: "success" | "neutral" | "featured"
}) {
  const toneClass =
    tone === "success"
      ? "bg-[rgba(22,128,59,0.22)] text-[var(--color-text)] ring-[rgba(22,128,59,0.4)]"
      : tone === "featured"
        ? "bg-[rgba(225,6,0,0.2)] text-[var(--color-text)] ring-[rgba(225,6,0,0.35)]"
        : "bg-[var(--color-surface-soft)] text-[var(--color-muted)] ring-[var(--color-border)]"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClass}`}>
      {label}
    </span>
  )
}

export default function ProductsTable({ products }: ProductsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-2 text-xs text-[var(--color-muted)] md:hidden">
        Vista compacta para mobile. Usa "Editar" para ajustes completos.
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {products.map((product) => (
          <article key={product.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">{product.name}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {product.brand || "Marca sin especificar"} - {product.categoryName}
                </p>
              </div>
              <StatusBadge
                label={product.isActive ? "Activo" : "Inactivo"}
                tone={product.isActive ? "success" : "neutral"}
              />
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-[var(--color-muted)]">Presentacion</dt>
                <dd className="font-medium text-[var(--color-text)]">{product.presentation || "Sin presentacion"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Precio</dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {product.unitPrice > 0 ? formatArsAmount(product.unitPrice) : "Sin precio"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Oferta</dt>
                <dd className="font-medium text-[var(--color-text)]">{product.isOnSale ? "Activa" : "No"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Imagenes</dt>
                <dd className="font-medium text-[var(--color-text)]">{product.imagesCount}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SaleToggleButton productId={product.id} isOnSale={product.isOnSale} />
              <ActiveToggleButton productId={product.id} isActive={product.isActive} />
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Editar
              </Link>
              <Link
                href={`/dashboard/products/${product.id}/images`}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Imagenes
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-surface-soft)]">
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Presentacion</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Oferta</th>
              <th className="px-4 py-3 font-semibold">Imagenes</th>
              <th className="px-4 py-3 font-semibold">Destacado</th>
              <th className="px-4 py-3 font-semibold">Activo</th>
              <th className="px-4 py-3 font-semibold">Orden</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {products.map((product) => (
              <tr key={product.id} className="align-top">
                <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">
                  <div className="grid gap-1">
                    <span>{product.name}</span>
                    <span className="text-xs font-normal text-[var(--color-muted)]">
                      {product.categoryName}
                      {product.brand ? ` - ${product.brand}` : ""}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{product.presentation || "Sin presentacion"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-semibold text-[var(--color-text)]">
                    {product.unitPrice > 0 ? formatArsAmount(product.unitPrice) : "Sin precio"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={product.isOnSale ? "En oferta" : "Sin oferta"}
                    tone={product.isOnSale ? "featured" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={product.imagesCount > 0 ? `${product.imagesCount} cargadas` : "Sin imagenes"}
                    tone={product.imagesCount > 0 ? "success" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={product.isFeatured ? "Si" : "No"}
                    tone={product.isFeatured ? "featured" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={product.isActive ? "Activo" : "Inactivo"}
                    tone={product.isActive ? "success" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{product.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <SaleToggleButton productId={product.id} isOnSale={product.isOnSale} />
                    <ActiveToggleButton productId={product.id} isActive={product.isActive} />
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/dashboard/products/${product.id}/images`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                    >
                      Imagenes
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
