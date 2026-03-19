import { InquiryStatus } from "@prisma/client"

export const INQUIRY_STATUS_VALUES = [
  InquiryStatus.NEW,
  InquiryStatus.CONTACTED,
  InquiryStatus.CLOSED,
] as const

export function isInquiryStatus(value: string): value is InquiryStatus {
  return INQUIRY_STATUS_VALUES.includes(value as InquiryStatus)
}

export function getInquiryStatusLabel(status: InquiryStatus): string {
  if (status === InquiryStatus.NEW) return "Nueva"
  if (status === InquiryStatus.CONTACTED) return "Contactada"
  return "Cerrada"
}

export function getInquiryStatusTone(status: InquiryStatus): "new" | "contacted" | "closed" {
  if (status === InquiryStatus.NEW) return "new"
  if (status === InquiryStatus.CONTACTED) return "contacted"
  return "closed"
}
