"use client"

import { InquiryStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { getInquiryStatusLabel, INQUIRY_STATUS_VALUES } from "@/lib/inquiry-status"

import { updateInquiryStatusAction } from "./actions"

type InquiryStatusSelectProps = {
  inquiryId: string
  status: InquiryStatus
}

export default function InquiryStatusSelect({ inquiryId, status }: InquiryStatusSelectProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>(status)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSelectedStatus(status)
  }, [status])

  async function handleStatusChange(nextStatus: InquiryStatus) {
    const previousStatus = selectedStatus
    setSelectedStatus(nextStatus)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set("status", nextStatus)
        await updateInquiryStatusAction(inquiryId, formData)
        router.refresh()
      } catch {
        setSelectedStatus(previousStatus)
      }
    })
  }

  return (
    <select
      name="status"
      value={selectedStatus}
      disabled={isPending}
      onChange={(event) => handleStatusChange(event.target.value as InquiryStatus)}
      className="h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-text)] outline-none transition focus:border-[#3a3d44] focus:ring-2 focus:ring-[rgba(225,6,0,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
      aria-label="Cambiar estado de la consulta"
    >
      {INQUIRY_STATUS_VALUES.map((value) => (
        <option key={value} value={value}>
          {getInquiryStatusLabel(value)}
        </option>
      ))}
    </select>
  )
}
