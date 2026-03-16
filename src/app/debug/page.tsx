import { redirect } from "next/navigation"

import { AdminAuthorizationError, requireAdmin } from "@/lib/require-admin"

export default async function DebugPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/dashboard")
  }

  let session
  try {
    session = await requireAdmin()
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirect("/login")
    }

    throw error
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6">
      <h1 className="text-xl font-semibold text-zinc-900">Debug de sesión (admin)</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Vista técnica para desarrollo. No expone el token completo.
      </p>

      <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-700">
          <span className="font-semibold">Usuario:</span> {session.user?.name || "Sin nombre"}
        </p>
        <p className="mt-1 text-sm text-zinc-700">
          <span className="font-semibold">Email:</span> {session.user?.email || "Sin email"}
        </p>
        <p className="mt-1 text-sm text-zinc-700">
          <span className="font-semibold">Rol:</span> {session.user?.role || "Sin rol"}
        </p>
      </div>
    </main>
  )
}
