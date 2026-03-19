"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button, Card, Input } from "@/components/ui"

import { registerAdminAction } from "./actions"
import { initialRegisterActionState } from "./state"

const MIN_PASSWORD_LENGTH = 8

export default function RegisterForm({ bootstrapToken }: { bootstrapToken: string }) {
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
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] py-8">
      <div className="mx-auto max-w-md p-4">
        <Card className="p-5 md:p-6">
          <h1 className="mb-2 text-xl font-bold text-[var(--color-text)]">Configurar administrador</h1>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Esta instalacion admite una cuenta administradora inicial para gestionar SoloAderezos.
          </p>

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="bootstrapToken" value={bootstrapToken} />
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Tu nombre
              </label>
              <Input
                id="name"
                name="name"
                maxLength={80}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Contrasena
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Minimo {MIN_PASSWORD_LENGTH} caracteres.
              </p>
            </div>

            {state.error ? <p className="rounded-lg border border-[var(--color-border)] bg-[rgba(225,6,0,0.18)] p-3 text-sm text-[var(--color-text)]">{state.error}</p> : null}

            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Creando cuenta..." : "Crear cuenta administradora"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
