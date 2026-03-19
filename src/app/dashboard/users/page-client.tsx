"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import {
  copyActivationLinkAction,
  createUserAction,
  deleteUserAction,
  regenerateActivationLinkAction,
} from "./actions"
import { initialUserActionState } from "./state"

type User = {
  id: string
  email: string
  mustSetPassword: boolean
  passwordSetupExpiresAt: Date | null
  createdAt: Date
}

type Props = {
  users: User[]
  protectedAdminEmail: string
}

export default function UsersPageClient({ users, protectedAdminEmail }: Props) {
  const router = useRouter()
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [createState, createFormAction, createPending] = useActionState(
    createUserAction,
    initialUserActionState,
  )
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteUserAction,
    initialUserActionState,
  )
  const [regenerateState, regenerateFormAction, regeneratePending] = useActionState(
    regenerateActivationLinkAction,
    initialUserActionState,
  )
  const [copyState, copyFormAction, copyPending] = useActionState(
    copyActivationLinkAction,
    initialUserActionState,
  )

  useEffect(() => {
    if (createState.success || deleteState.success || regenerateState.success) {
      router.refresh()
    }
  }, [router, createState.success, deleteState.success, regenerateState.success])

  useEffect(() => {
    if (!copyState.success || !copyState.activationLink) return

    const activationLink = copyState.activationLink
    void (async () => {
      try {
        await navigator.clipboard.writeText(activationLink)
        setCopyFeedback("Enlace de activacion copiado.")
      } catch {
        setCopyFeedback("No se pudo copiar el enlace. Copialo manualmente desde la consola.")
      }
    })()
  }, [copyState.success, copyState.activationLink])

  useEffect(() => {
    if (copyState.error) {
      setCopyFeedback(copyState.error)
    }
  }, [copyState.error])

  return (
    <div className="mx-auto w-full max-w-[124rem] p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">Gestion de usuarios autorizados</h1>

      <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Agregar usuario</h2>
        <form action={createFormAction} className="flex flex-wrap gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email del usuario"
            required
            className="h-11 min-w-[280px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[#3a3d44]"
          />
          <button
            type="submit"
            disabled={createPending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {createPending ? "Agregando..." : "Agregar"}
          </button>
        </form>
        {createState.error && <p className="mt-2 text-sm text-[var(--color-primary)]">{createState.error}</p>}
        {createState.success && <p className="mt-2 text-sm text-[var(--color-text)]">Usuario agregado exitosamente.</p>}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Usuarios autorizados</h2>
        {users.length === 0 ? (
          <p className="text-[var(--color-muted)]">No hay usuarios autorizados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[var(--color-border)]">
              <thead>
                <tr className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                  <th className="border border-[var(--color-border)] px-4 py-2 text-left">Email</th>
                  <th className="border border-[var(--color-border)] px-4 py-2 text-left">Estado</th>
                  <th className="border border-[var(--color-border)] px-4 py-2 text-left">Fecha de creacion</th>
                  <th className="border border-[var(--color-border)] px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border border-[var(--color-border)] px-4 py-2 text-[var(--color-text)]">{user.email}</td>
                    <td className="border border-[var(--color-border)] px-4 py-2">
                      {user.mustSetPassword ? (
                        <div className="grid gap-1">
                          <span className="w-fit rounded-full bg-[rgba(225,6,0,0.18)] px-2 py-1 text-xs font-medium text-[var(--color-text)]">
                            Pendiente de activar
                          </span>
                          {user.passwordSetupExpiresAt ? (
                            <span className="text-xs text-[var(--color-muted)]">
                              Vence: {format(new Date(user.passwordSetupExpiresAt), "dd/MM/yyyy")}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="grid gap-1">
                          <span className="w-fit rounded-full bg-[rgba(22,128,59,0.2)] px-2 py-1 text-xs font-medium text-[var(--color-text)]">
                            Activo
                          </span>
                          {user.email.toLowerCase() === protectedAdminEmail ? (
                            <span className="w-fit rounded-full bg-[var(--color-surface-soft)] px-2 py-1 text-xs font-medium text-[var(--color-text)]">
                              Administrador principal
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="border border-[var(--color-border)] px-4 py-2 text-[var(--color-muted)]">
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="border border-[var(--color-border)] px-4 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.mustSetPassword ? (
                          <>
                            <form action={copyFormAction} className="inline">
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                disabled={copyPending}
                                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] disabled:opacity-60"
                              >
                                {copyPending ? "Copiando..." : "Copiar enlace"}
                              </button>
                            </form>
                            <form action={regenerateFormAction} className="inline">
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                disabled={regeneratePending}
                                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] disabled:opacity-60"
                              >
                                {regeneratePending ? "Regenerando..." : "Regenerar"}
                              </button>
                            </form>
                          </>
                        ) : null}
                        {user.email.toLowerCase() === protectedAdminEmail ? (
                          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                            Protegido
                          </span>
                        ) : (
                          <form action={deleteFormAction} className="inline">
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              disabled={deletePending}
                              className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                            >
                              Eliminar
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {deleteState.error && <p className="mt-2 text-sm text-[var(--color-primary)]">{deleteState.error}</p>}
        {deleteState.success && <p className="mt-2 text-sm text-[var(--color-text)]">Usuario eliminado exitosamente.</p>}
        {regenerateState.error && <p className="mt-2 text-sm text-[var(--color-primary)]">{regenerateState.error}</p>}
        {regenerateState.success && <p className="mt-2 text-sm text-[var(--color-text)]">Enlace regenerado exitosamente.</p>}
        {copyFeedback && <p className="mt-2 text-sm text-[var(--color-muted)]">{copyFeedback}</p>}
      </div>
    </div>
  )
}
