"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"

export default function AdminSignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/" })
        })
      }
      disabled={isPending}
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Cerrando..." : "Cerrar sesion"}
    </button>
  )
}
