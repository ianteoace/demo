"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { setPasswordAction } from "./actions"
import { initialSetPasswordActionState } from "./state"

const MIN_PASSWORD_LENGTH = 8

export default function ActivateAccessForm({ token, email }: { token: string; email: string }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    setPasswordAction,
    initialSetPasswordActionState,
  )

  useEffect(() => {
    if (state.success) {
      router.push("/login?message=Contrasena configurada exitosamente. Inicia sesion.")
    }
  }, [router, state.success])

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-2 text-xl font-bold">Activar acceso</h1>
      <p className="mb-1 text-sm text-gray-600">Configura tu contrasena para activar tu cuenta de administrador.</p>
      <p className="mb-4 text-sm text-gray-600">
        Cuenta: <span className="font-medium text-zinc-800">{email}</span>
      </p>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="token" value={token} />

        <div>
          <label htmlFor="password" className="block">
            Nueva contrasena
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className="w-full rounded border px-2 py-1"
          />
          <p className="mt-1 text-xs text-gray-500">Minimo {MIN_PASSWORD_LENGTH} caracteres.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block">
            Confirmar contrasena
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            required
            autoComplete="new-password"
            className="w-full rounded border px-2 py-1"
          />
        </div>

        {state.error ? <p className="text-red-600">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {pending ? "Activando..." : "Activar acceso"}
        </button>
      </form>
    </div>
  )
}
