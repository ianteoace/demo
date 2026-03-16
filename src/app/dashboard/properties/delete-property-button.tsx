"use client"

import { useFormStatus } from "react-dom"

import { deletePropertyAction } from "./actions"

type DeletePropertyButtonProps = {
  propertyId: string
  className?: string
  label?: string
}

function SubmitButton({ className, label }: { className?: string; label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ||
        "inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      {pending ? "Eliminando..." : label}
    </button>
  )
}

export default function DeletePropertyButton({
  propertyId,
  className,
  label = "Eliminar",
}: DeletePropertyButtonProps) {
  const deleteAction = deletePropertyAction.bind(null, propertyId)

  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Esta accion eliminara la propiedad y sus datos asociados. Deseas continuar?",
        )

        if (!confirmed) {
          event.preventDefault()
        }
      }}
    >
      <SubmitButton className={className} label={label} />
    </form>
  )
}
