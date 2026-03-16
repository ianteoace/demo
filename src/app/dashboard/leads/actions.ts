"use server"

import { revalidatePath } from "next/cache"

import { isLeadStatus } from "@/lib/lead-status"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function deleteLeadAction(leadId: string) {
  await requireAdmin()

  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true },
  })

  if (!existingLead) {
    return
  }

  await prisma.lead.delete({
    where: { id: leadId },
  })

  revalidatePath("/dashboard/leads")
}

export async function updateLeadStatusAction(leadId: string, formData: FormData) {
  await requireAdmin()

  const statusValue = formData.get("status")
  const status = typeof statusValue === "string" ? statusValue : ""

  if (!isLeadStatus(status)) {
    return
  }

  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true },
  })

  if (!existingLead) {
    return
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
    },
  })

  revalidatePath("/dashboard/leads")
}
