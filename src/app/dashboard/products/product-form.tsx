"use client"

import { useActionState } from "react"

import { Button, Card, Input, Select, Textarea } from "@/components/ui"
import type { ProductFormValues } from "@/types/product"
import {
  EMPTY_PRODUCT_ACTION_STATE,
  type ProductActionState,
} from "./product-action-state"

type ProductFormProps = {
  initialValues: ProductFormValues
  submitLabel: string
  title: string
  categories: Array<{
    id: string
    name: string
    isActive: boolean
  }>
  action: (
    prevState: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-medium text-[var(--color-text)]">{children}</span>
}

export default function ProductForm({
  initialValues,
  submitLabel,
  title,
  categories,
  action,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, EMPTY_PRODUCT_ACTION_STATE)

  return (
    <main className="py-8 md:py-10">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)] md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)] md:text-base">
            Completa la ficha comercial del producto para publicarlo en el futuro catalogo mayorista.
          </p>
        </div>

        <form action={formAction} className="grid gap-6">
          {isPending ? (
            <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-muted)]">
              Guardando cambios...
            </p>
          ) : null}

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Informacion principal</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1.5">
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  name="name"
                  type="text"
                  placeholder="Ej: Mayonesa clasica 1kg"
                  defaultValue={initialValues.name}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Slug (opcional)</FieldLabel>
                <Input
                  name="slug"
                  type="text"
                  placeholder="se-genera-automaticamente-si-queda-vacio"
                  defaultValue={initialValues.slug}
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Descripcion corta</FieldLabel>
                <Textarea
                  name="shortDescription"
                  placeholder="Resumen breve para listados"
                  defaultValue={initialValues.shortDescription}
                  rows={3}
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Descripcion completa</FieldLabel>
                <Textarea
                  name="description"
                  placeholder="Descripcion comercial extendida"
                  defaultValue={initialValues.description}
                  rows={6}
                />
              </label>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Clasificacion comercial</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <FieldLabel>Categoria</FieldLabel>
                <Select name="categoryId" defaultValue={initialValues.categoryId} required>
                  <option value="">Selecciona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {category.isActive ? "" : " (inactiva)"}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Marca</FieldLabel>
                <Input
                  name="brand"
                  type="text"
                  placeholder="Ej: SoloAderezos"
                  defaultValue={initialValues.brand}
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Presentacion</FieldLabel>
                <Input
                  name="presentation"
                  type="text"
                  placeholder="Ej: Doypack 1kg"
                  defaultValue={initialValues.presentation}
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Precio unitario (ARS)</FieldLabel>
                <Input
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={initialValues.unitPrice}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Orden</FieldLabel>
                <Input
                  name="sortOrder"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={initialValues.sortOrder}
                />
              </label>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Estado</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2.5 text-sm text-[var(--color-muted)]">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={initialValues.isActive}
                  className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]"
                />
                Activo
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2.5 text-sm text-[var(--color-muted)]">
                <input
                  name="isOnSale"
                  type="checkbox"
                  defaultChecked={initialValues.isOnSale}
                  className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]"
                />
                En oferta
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2.5 text-sm text-[var(--color-muted)]">
                <input
                  name="isFeatured"
                  type="checkbox"
                  defaultChecked={initialValues.isFeatured}
                  className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]"
                />
                Destacado
              </label>
            </div>
          </Card>

          {state.error ? (
            <p className="rounded-xl border border-[var(--color-border)] bg-[rgba(225,6,0,0.18)] p-3 text-sm text-[var(--color-text)]">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
