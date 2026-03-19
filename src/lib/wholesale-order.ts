export const WHOLESALE_MINIMUM_ITEMS = 50

export function getRemainingItemsForMinimum(totalItems: number): number {
  return Math.max(0, WHOLESALE_MINIMUM_ITEMS - totalItems)
}

export function hasReachedWholesaleMinimum(totalItems: number): boolean {
  return totalItems >= WHOLESALE_MINIMUM_ITEMS
}
