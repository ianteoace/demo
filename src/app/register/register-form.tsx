"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { registerAdminAction } from "./actions"
import { initialRegisterActionState } from "./state"

const MIN_PASSWORD_LENGTH = 8

export default function RegisterForm() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    registerAdminAction,
    initialRegisterActionState,
  )

  useEffect(() => {
    if (state.success) {
      router.push("/login")
      router.refresh()
    }
  }, [router, state.success])

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-2 text-xl font-bold">Configurar administrador</h1>
      <p className="mb-4 text-sm text-gray-600">
        Esta instalacion admite una sola inmobiliaria y una cuenta
        administradora inicial.
      </p>

      <form action={formAction} className="space-y-3">
        <div>
          <label htmlFor="name" className="block">
            Tu nombre
          </label>
          <input
            id="name"
            name="name"
            maxLength={80}
            required
            autoComplete="name"
            className="w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <label htmlFor="email" className="block">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <label htmlFor="password" className="block">
            Contraseña
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
          <p className="mt-1 text-xs text-gray-500">
            Minimo {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        </div>

        {state.error ? <p className="text-red-600">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {pending ? "Creando cuenta..." : "Crear cuenta administradora"}
        </button>
      </form>
    </div>
  )
}
