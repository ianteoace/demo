"use server"

import { revalidatePath } from "next/cache"

import { isInquiryStatus } from "@/lib/inquiry-status"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function updateInquiryStatusAction(inquiryId: string, formData: FormData) {
  await requireAdmin()

  const statusValue = formData.get("status")
  const status = typeof statusValue === "string" ? statusValue : ""

  if (!isInquiryStatus(status)) {
    return
  }

  const existingInquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { id: true },
  })

  if (!existingInquiry) {
    return
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      status,
    },
  })

  revalidatePath("/dashboard/inquiries")
}
