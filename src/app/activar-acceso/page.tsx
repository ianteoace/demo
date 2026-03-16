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
      <div className="mx-auto max-w-md p-4">
        <h1 className="mb-4 text-xl font-bold">Enlace invalido</h1>
        <p>El enlace de activacion no es valido o ha expirado.</p>
      </div>
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
      <div className="mx-auto max-w-md p-4">
        <h1 className="mb-4 text-xl font-bold">Enlace invalido</h1>
        <p>El enlace de activacion no es valido o ya fue utilizado.</p>
      </div>
    )
  }

  if (!user.passwordSetupExpiresAt || user.passwordSetupExpiresAt < new Date()) {
    return (
      <div className="mx-auto max-w-md p-4">
        <h1 className="mb-4 text-xl font-bold">Enlace expirado</h1>
        <p>Tu enlace de activacion vencio. Solicita uno nuevo al administrador.</p>
      </div>
    )
  }

  return <ActivateAccessForm token={token} email={user.email} />
}
