import { redirect } from "next/navigation"

import { getAuthSession } from "@/auth"
import { getAppUrl } from "@/lib/app-url"
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
      passwordSetupToken: true,
      passwordSetupExpiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return <UsersPageClient users={users} appUrl={getAppUrl()} />
}
