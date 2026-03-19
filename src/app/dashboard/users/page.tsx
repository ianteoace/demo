import { redirect } from "next/navigation"

import { getAuthSession } from "@/auth"
import { getPrimaryAdminEmail } from "@/lib/primary-admin"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

import UsersPageClient from "./page-client"

export default async function UsersPage() {
  const session = await getAuthSession()
  if (!session) redirect("/login")

  await requireAdmin(session)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      mustSetPassword: true,
      passwordSetupExpiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <UsersPageClient
      users={users}
      protectedAdminEmail={getPrimaryAdminEmail()}
    />
  )
}
