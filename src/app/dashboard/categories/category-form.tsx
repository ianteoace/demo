"use client"

import { useActionState, useMemo, useState } from "react"

import { buildCategorySlug } from "@/lib/category"
import { Button, Card, Input } from "@/components/ui"
import type { CategoryFormValues } from "@/types/category"
import {
  EMPTY_CATEGORY_ACTION_STATE,
  type CategoryActionState,
} from "./category-action-state"

type CategoryFormProps = {
  title: string
  submitLabel: string
  initialValues: CategoryFormValues
  action: (
    prevState: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-medium text-[var(--color-text)]">{children}</span>
}

export default function CategoryForm({
  title,
  submitLabel,
  initialValues,
  action,
}: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, EMPTY_CATEGORY_ACTION_STATE)
  const [name, setName] = useState(initialValues.name)
  const [slug, setSlug] = useState(initialValues.slug)
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(initialValues.slug))

  const slugPreview = useMemo(() => {
    const candidate = slug || buildCategorySlug(name)
    return candidate || "categoria"
  }, [name, slug])

  return (
    <main className="py-8 md:py-10">
      <div className="mx-auto w-full max-w-2xl px-4 md:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)] md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)] md:text-base">
            Gestiona la base de categorias que se usa en el catalogo y en formularios de productos.
          </p>
        </div>

        <form action={formAction} className="grid gap-6">
          <Card className="p-5 md:p-6">
            <div className="grid gap-4">
              <label className="grid gap-1.5">
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  name="name"
                  type="text"
                  placeholder="Ej: Salsas especiales"
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value
                    setName(nextName)
                    if (!isSlugEdited) {
                      setSlug(buildCategorySlug(nextName))
                    }
                  }}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Slug</FieldLabel>
                <Input
                  name="slug"
                  type="text"
                  placeholder="salsas-especiales"
                  value={slug}
                  onChange={(event) => {
                    setIsSlugEdited(true)
                    setSlug(event.target.value.toLowerCase())
                  }}
                />
                <p className="text-xs text-[var(--color-muted)]">
                  URL estimada: <span className="font-medium text-[var(--color-text)]">/productos?category={slugPreview}</span>
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Usa un slug corto y unico para evitar conflictos en filtros.
                </p>
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
