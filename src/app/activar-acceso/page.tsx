import { prisma } from "@/lib/prisma"

import ActivateAccessForm from "./activate-access-form"

type SearchParams = Promise<{
  token?: string
}>

export default async function ActivateAccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const token = resolvedSearchParams.token?.trim()

  if (!token) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] py-8">
        <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h1 className="mb-4 text-xl font-bold text-[var(--color-text)]">Enlace invalido</h1>
          <p className="text-[var(--color-muted)]">El enlace de activacion no es valido o ha expirado.</p>
        </div>
      </main>
    )
  }

  const user = await prisma.user.findUnique({
    where: { passwordSetupToken: token },
    select: {
      id: true,
      email: true,
      mustSetPassword: true,
      passwordSetupExpiresAt: true,
    },
  })

  if (!user || !user.mustSetPassword) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] py-8">
        <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h1 className="mb-4 text-xl font-bold text-[var(--color-text)]">Enlace invalido</h1>
          <p className="text-[var(--color-muted)]">El enlace de activacion no es valido o ya fue utilizado.</p>
        </div>
      </main>
    )
  }

  if (!user.passwordSetupExpiresAt || user.passwordSetupExpiresAt < new Date()) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] py-8">
        <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h1 className="mb-4 text-xl font-bold text-[var(--color-text)]">Enlace expirado</h1>
          <p className="text-[var(--color-muted)]">Tu enlace de activacion vencio. Solicita uno nuevo al administrador.</p>
        </div>
      </main>
    )
  }

  return <ActivateAccessForm token={token} email={user.email} />
}
