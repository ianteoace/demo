import { Currency } from "@prisma/client"

export const CURRENCY_VALUES = [
  Currency.ARS,
  Currency.USD,
] as const

export function isCurrency(value: string): value is Currency {
  return CURRENCY_VALUES.includes(value as Currency)
}

export function getCurrencyLabel(currency: Currency): string {
  return currency === Currency.USD ? "USD" : "Pesos argentinos"
}

export function formatPropertyPrice(price: number, currency: Currency): string {
  const amount = price.toLocaleString("es-AR")
  return currency === Currency.USD ? `USD ${amount}` : `$ ${amount}`
}
