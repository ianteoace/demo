"use client"

import { LeadStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { getLeadStatusLabel, LEAD_STATUS_VALUES } from "@/lib/lead-status"

import { updateLeadStatusAction } from "./actions"

type LeadStatusSelectProps = {
  leadId: string
  status: LeadStatus
}

export default function LeadStatusSelect({ leadId, status }: LeadStatusSelectProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(status)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSelectedStatus(status)
  }, [status])

  async function handleStatusChange(nextStatus: LeadStatus) {
    const previousStatus = selectedStatus
    setSelectedStatus(nextStatus)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set("status", nextStatus)
        await updateLeadStatusAction(leadId, formData)
        router.refresh()
      } catch {
        setSelectedStatus(previousStatus)
      }
    })
  }

  return (
    <div className="flex items-center">
      <select
        name="status"
        value={selectedStatus}
        disabled={isPending}
        onChange={(event) => handleStatusChange(event.target.value as LeadStatus)}
        className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Cambiar estado del lead"
      >
        {LEAD_STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {getLeadStatusLabel(value)}
          </option>
        ))}
      </select>
    </div>
  )
}
