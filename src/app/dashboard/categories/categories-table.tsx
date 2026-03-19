import Link from "next/link"

import { Card } from "@/components/ui"

import DeleteCategoryButton from "./delete-category-button"

type CategoryRow = {
  id: string
  name: string
  slug: string
  productsCount: number
}

type CategoriesTableProps = {
  categories: CategoryRow[]
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-2 text-xs text-[var(--color-muted)] md:hidden">
        Vista compacta para mobile.
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {categories.map((category) => (
          <article key={category.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
            <p className="text-sm font-semibold text-[var(--color-text)]">{category.name}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">Slug: {category.slug}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Productos asociados:{" "}
              <span className="font-medium text-[var(--color-text)]">{category.productsCount}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/categories/${category.id}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
              >
                Editar
              </Link>
              <DeleteCategoryButton
                categoryId={category.id}
                categoryName={category.name}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-surface-soft)]">
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Productos asociados</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {categories.map((category) => (
              <tr key={category.id} className="align-top">
                <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">
                  {category.name}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{category.slug}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                  {category.productsCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/categories/${category.id}/edit`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
                    >
                      Editar
                    </Link>
                    <DeleteCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                    />
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
