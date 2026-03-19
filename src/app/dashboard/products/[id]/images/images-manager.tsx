"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import EmptyState from "@/components/public/empty-state"
import { Button, Card, Input } from "@/components/ui"

import {
  deleteProductImageAction,
  reorderProductImageAction,
  uploadProductImageAction,
} from "./actions"
import { EMPTY_PRODUCT_IMAGE_ACTION_STATE } from "./product-image-action-state"

type ProductImage = {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

type ImagesManagerProps = {
  productId: string
  productName: string
  initialImages: ProductImage[]
}

function ActionButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string
  pendingLabel: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="secondary" disabled={pending || disabled} className="h-9 px-4 text-xs">
      {pending ? pendingLabel : label}
    </Button>
  )
}

function DeleteActionButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-primary)]/45 bg-[rgba(225,6,0,0.18)] px-4 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[rgba(225,6,0,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  )
}

export default function ImagesManager({
  productId,
  productName,
  initialImages,
}: ImagesManagerProps) {
  const [uploadState, uploadAction] = useActionState(
    uploadProductImageAction.bind(null, productId),
    EMPTY_PRODUCT_IMAGE_ACTION_STATE,
  )
  const [deleteState, deleteAction] = useActionState(
    deleteProductImageAction.bind(null, productId),
    EMPTY_PRODUCT_IMAGE_ACTION_STATE,
  )
  const [reorderState, reorderAction] = useActionState(
    reorderProductImageAction.bind(null, productId),
    EMPTY_PRODUCT_IMAGE_ACTION_STATE,
  )

  const error = uploadState.error || deleteState.error || reorderState.error

  return (
    <div className="grid gap-5">
      <Card className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Subir nueva imagen</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Puedes definir texto alternativo y luego ordenar las imagenes manualmente.
        </p>

        <form action={uploadAction} className="mt-4 grid gap-3 sm:max-w-lg">
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-surface-soft)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--color-text)]"
          />
          <Input name="alt" type="text" placeholder="Texto alternativo (opcional)" />
          <div>
            <Button type="submit">Subir imagen</Button>
          </div>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-[var(--color-border)] bg-[rgba(225,6,0,0.18)] p-3 text-sm text-[var(--color-text)]">
            {error}
          </p>
        ) : null}
      </Card>

      {initialImages.length === 0 ? (
        <EmptyState
          title="Este producto todavia no tiene imagenes"
          description="Sube al menos una imagen para preparar su ficha comercial."
          note="Podras reordenarlas despues de cargarlas."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialImages.map((image, index) => (
            <Card key={image.id} className="overflow-hidden">
              <img
                src={image.url}
                alt={image.alt || productName}
                className="h-52 w-full object-cover"
              />

              <div className="grid gap-3 p-4">
                <p className="text-sm text-[var(--color-text)]">
                  Posicion: <strong>{index + 1}</strong>
                </p>
                <p className="text-xs text-[var(--color-muted)]">{image.alt || "Sin texto alternativo"}</p>

                <div className="flex flex-wrap gap-2">
                  <form action={reorderAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="up" />
                    <ActionButton
                      label="Subir"
                      pendingLabel="Moviendo..."
                      disabled={index === 0}
                    />
                  </form>

                  <form action={reorderAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="down" />
                    <ActionButton
                      label="Bajar"
                      pendingLabel="Moviendo..."
                      disabled={index === initialImages.length - 1}
                    />
                  </form>

                  <form
                    action={deleteAction}
                    onSubmit={(event) => {
                      const confirmed = window.confirm(
                        "Vas a eliminar esta imagen del producto. Deseas continuar?",
                      )
                      if (!confirmed) {
                        event.preventDefault()
                      }
                    }}
                  >
                    <input type="hidden" name="imageId" value={image.id} />
                    <DeleteActionButton />
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
