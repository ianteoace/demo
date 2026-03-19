"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { deleteCategoryAction } from "./actions"

type DeleteCategoryButtonProps = {
  categoryId: string
  categoryName: string
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    const confirmed = window.confirm(
      `Vas a eliminar la categoria "${categoryName}". Esta accion no se puede deshacer.`
    )
    if (!confirmed) return

    setError(null)
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId)
      if (result.error) {
        if (result.error.includes("productos asociados")) {
          setError("No se puede eliminar: primero reasigna o desactiva los productos de esta categoria.")
          return
        }

        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-primary)]/45 bg-[rgba(225,6,0,0.18)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[rgba(225,6,0,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Eliminando..." : "Eliminar"}
      </button>
      {error ? (
        <p className="rounded-md border border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.14)] px-2 py-1 text-xs text-[var(--color-text)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
