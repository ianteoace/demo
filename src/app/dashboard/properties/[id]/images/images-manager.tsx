"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import EmptyState from "@/components/public/empty-state"
import { Button, Card } from "@/components/ui"

import {
  deletePropertyImageAction,
  setPrimaryImageAction,
  uploadPropertyImageAction,
} from "./actions"
import { EMPTY_PROPERTY_IMAGE_ACTION_STATE } from "./property-image-action-state"

type PropertyImage = {
  id: string
  url: string
  isPrimary: boolean
}

type ImagesManagerProps = {
  propertyId: string
  propertyTitle: string
  initialImages: PropertyImage[]
}

function ActionButton({
  label,
  pendingLabel,
  variant = "secondary",
  disabled,
}: {
  label: string
  pendingLabel: string
  variant?: "secondary" | "primary" | "danger"
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant === "primary" ? "primary" : "secondary"}
      disabled={pending || disabled}
      className={
        variant === "danger"
          ? "h-9 border-red-200 bg-red-50 px-4 text-xs text-red-700 hover:bg-red-100"
          : "h-9 px-4 text-xs"
      }
    >
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
      className="inline-flex h-9 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  )
}

export default function ImagesManager({
  propertyId,
  propertyTitle,
  initialImages,
}: ImagesManagerProps) {
  const [uploadState, uploadAction] = useActionState(
    uploadPropertyImageAction.bind(null, propertyId),
    EMPTY_PROPERTY_IMAGE_ACTION_STATE,
  )
  const [deleteState, deleteAction] = useActionState(
    deletePropertyImageAction.bind(null, propertyId),
    EMPTY_PROPERTY_IMAGE_ACTION_STATE,
  )
  const [setPrimaryState, setPrimaryAction] = useActionState(
    setPrimaryImageAction.bind(null, propertyId),
    EMPTY_PROPERTY_IMAGE_ACTION_STATE,
  )

  const error = uploadState.error || deleteState.error || setPrimaryState.error

  return (
    <div className="grid gap-5">
      <Card className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Subir nueva imagen</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Formatos sugeridos: JPG o PNG. La primera imagen cargada queda como principal.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Al subir correctamente, la imagen aparecerá en la grilla inferior.
        </p>

        <form action={uploadAction} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="block w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-700"
          />
          <ActionButton label="Subir imagen" pendingLabel="Subiendo..." variant="primary" />
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </Card>

      {initialImages.length === 0 ? (
        <EmptyState
          title="Esta propiedad todavía no tiene imágenes"
          description="Sube al menos una imagen para mejorar la publicación y destacar la portada en el listado."
          note="Consejo: usa una foto exterior o del ambiente principal como primera imagen."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={image.url}
                  alt={propertyTitle}
                  className="h-52 w-full object-cover"
                />
                {image.isPrimary ? (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    Principal
                  </span>
                ) : null}
              </div>

              <div className="grid gap-3 p-4">
                <p className="text-sm text-zinc-600">
                  {image.isPrimary ? "Imagen principal activa" : "Imagen secundaria"}
                </p>

                <div className="flex flex-wrap gap-2">
                  <form action={setPrimaryAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <ActionButton
                      label={image.isPrimary ? "Principal" : "Marcar principal"}
                      pendingLabel="Guardando..."
                      disabled={image.isPrimary}
                    />
                  </form>

                  <form
                    action={deleteAction}
                    onSubmit={(event) => {
                      const confirmed = window.confirm(
                        "Vas a eliminar esta imagen de la propiedad. ¿Deseas continuar?",
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
