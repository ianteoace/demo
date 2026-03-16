import { LeadStatus } from "@prisma/client"

export const LEAD_STATUS_VALUES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.CLOSED,
] as const

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUS_VALUES.includes(value as LeadStatus)
}

export function getLeadStatusLabel(status: LeadStatus): string {
  if (status === LeadStatus.NEW) return "Pendiente"
  if (status === LeadStatus.CONTACTED) return "Contactado"
  return "Cerrado"
}

export function getLeadStatusTone(status: LeadStatus): "new" | "contacted" | "closed" {
  if (status === LeadStatus.NEW) return "new"
  if (status === LeadStatus.CONTACTED) return "contacted"
  return "closed"
}
