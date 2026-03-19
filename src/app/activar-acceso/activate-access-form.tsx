"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { setPasswordAction } from "./actions"
import { initialSetPasswordActionState } from "./state"
import { Button, Card, Input } from "@/components/ui"

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
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] py-8">
      <div className="mx-auto max-w-md p-4">
        <Card className="p-5 md:p-6">
          <h1 className="mb-2 text-xl font-bold text-[var(--color-text)]">Activar acceso</h1>
          <p className="mb-1 text-sm text-[var(--color-muted)]">Configura tu contrasena para activar tu cuenta de administrador.</p>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Cuenta: <span className="font-medium text-[var(--color-text)]">{email}</span>
          </p>

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="token" value={token} />

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Nueva contrasena
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">Minimo {MIN_PASSWORD_LENGTH} caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Confirmar contrasena
              </label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                required
                autoComplete="new-password"
              />
            </div>

            {state.error ? <p className="rounded-lg border border-[var(--color-border)] bg-[rgba(225,6,0,0.18)] p-3 text-sm text-[var(--color-text)]">{state.error}</p> : null}

            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Activando..." : "Activar acceso"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
