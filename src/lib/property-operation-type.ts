import { OperationType } from "@prisma/client"

export const OPERATION_TYPE_VALUES = [
  OperationType.SALE,
  OperationType.RENT,
  OperationType.BOTH,
] as const

export function isOperationType(value: string): value is OperationType {
  return OPERATION_TYPE_VALUES.includes(value as OperationType)
}

export function getOperationTypeLabel(operationType: OperationType): string {
  if (operationType === OperationType.SALE) return "Venta"
  if (operationType === OperationType.RENT) return "Alquiler"
  return "Venta y alquiler"
}
