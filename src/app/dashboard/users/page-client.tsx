"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { createUserAction, deleteUserAction, regenerateActivationLinkAction } from "./actions"
import { initialUserActionState } from "./state"

const PROTECTED_ADMIN_EMAIL = "admin@inmo.com"

type User = {
  id: string
  email: string
  mustSetPassword: boolean
  passwordSetupToken: string | null
  passwordSetupExpiresAt: Date | null
  createdAt: Date
}

type Props = {
  users: User[]
  appUrl: string
}

function buildActivationLink(appUrl: string, token: string) {
  return `${appUrl}/activar-acceso?token=${token}`
}

export default function UsersPageClient({ users, appUrl }: Props) {
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

  useEffect(() => {
    if (createState.success || deleteState.success || regenerateState.success) {
      router.refresh()
    }
  }, [router, createState.success, deleteState.success, regenerateState.success])

  async function handleCopyActivationLink(user: User) {
    if (!user.passwordSetupToken) {
      setCopyFeedback("No hay token de activacion para ese usuario.")
      return
    }

    const activationLink = buildActivationLink(appUrl, user.passwordSetupToken)

    try {
      await navigator.clipboard.writeText(activationLink)
      setCopyFeedback("Enlace de activacion copiado.")
    } catch {
      setCopyFeedback("No se pudo copiar el enlace. Copialo manualmente desde la consola.")
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Gestión de usuarios autorizados</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Agregar usuario</h2>
        <form action={createFormAction} className="flex gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email del usuario"
            required
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="submit"
            disabled={createPending}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {createPending ? "Agregando..." : "Agregar"}
          </button>
        </form>
        {createState.error && <p className="mt-2 text-red-600">{createState.error}</p>}
        {createState.success && <p className="mt-2 text-green-600">Usuario agregado exitosamente.</p>}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Usuarios autorizados</h2>
        {users.length === 0 ? (
          <p>No hay usuarios autorizados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fecha de creación</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.mustSetPassword ? (
                        <div className="grid gap-1">
                          <span className="w-fit rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                            Pendiente de activar
                          </span>
                          {user.passwordSetupExpiresAt ? (
                            <span className="text-xs text-zinc-600">
                              Vence: {format(new Date(user.passwordSetupExpiresAt), "dd/MM/yyyy")}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="grid gap-1">
                          <span className="w-fit rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                            Activo
                          </span>
                          {user.email.toLowerCase() === PROTECTED_ADMIN_EMAIL ? (
                            <span className="w-fit rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                              Administrador principal
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.mustSetPassword ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleCopyActivationLink(user)}
                              disabled={!user.passwordSetupToken}
                              className="rounded bg-sky-600 px-3 py-1 text-white disabled:opacity-60"
                            >
                              Copiar enlace de activacion
                            </button>
                            <form action={regenerateFormAction} className="inline">
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                disabled={regeneratePending}
                                className="rounded bg-zinc-700 px-3 py-1 text-white disabled:opacity-60"
                              >
                                {regeneratePending ? "Regenerando..." : "Regenerar enlace"}
                              </button>
                            </form>
                          </>
                        ) : null}
                        {user.email.toLowerCase() === PROTECTED_ADMIN_EMAIL ? (
                          <span className="rounded border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                            Protegido
                          </span>
                        ) : (
                          <form action={deleteFormAction} className="inline">
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              disabled={deletePending}
                              className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-60"
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
        {deleteState.error && <p className="mt-2 text-red-600">{deleteState.error}</p>}
        {deleteState.success && <p className="mt-2 text-green-600">Usuario eliminado exitosamente.</p>}
        {regenerateState.error && <p className="mt-2 text-red-600">{regenerateState.error}</p>}
        {regenerateState.success && <p className="mt-2 text-green-600">Enlace regenerado exitosamente.</p>}
        {copyFeedback && <p className="mt-2 text-sm text-zinc-700">{copyFeedback}</p>}
      </div>
    </div>
  )
}
