"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

const CART_STORAGE_KEY = "soloaderezos-cart-v1"

export type CartItem = {
  productId: string
  slug: string
  name: string
  presentation: string | null
  brand: string | null
  imageUrl: string | null
  unitPrice: number
  quantity: number
}

type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  estimatedSubtotal: number
  addItem: (item: AddCartItemInput) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  hasHydrated: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function sanitizeQuantity(value: number) {
  if (!Number.isFinite(value)) return 1
  const next = Math.floor(value)
  if (next < 1) return 1
  if (next > 1000) return 1000
  return next
}

function sanitizeUnitPrice(value: number) {
  if (!Number.isFinite(value)) return 0
  const next = Math.floor(value)
  if (next < 0) return 0
  return next
}

function normalizeStoredItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []

  const result: CartItem[] = []

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue

    const productId =
      "productId" in entry && typeof entry.productId === "string" ? entry.productId.trim() : ""

    const slug = "slug" in entry && typeof entry.slug === "string" ? entry.slug.trim() : ""

    const name = "name" in entry && typeof entry.name === "string" ? entry.name.trim() : ""

    const presentation =
      "presentation" in entry && typeof entry.presentation === "string"
        ? entry.presentation.trim() || null
        : null

    const brand =
      "brand" in entry && typeof entry.brand === "string" ? entry.brand.trim() || null : null

    const imageUrl =
      "imageUrl" in entry && typeof entry.imageUrl === "string"
        ? entry.imageUrl.trim() || null
        : null

    const quantity =
      "quantity" in entry && typeof entry.quantity === "number"
        ? sanitizeQuantity(entry.quantity)
        : 1
    const unitPrice =
      "unitPrice" in entry && typeof entry.unitPrice === "number"
        ? sanitizeUnitPrice(entry.unitPrice)
        : 0

    if (!productId || !slug || !name) continue

    result.push({
      productId,
      slug,
      name,
      presentation,
      brand,
      imageUrl,
      unitPrice,
      quantity,
    })
  }

  return result
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (raw) {
        setItems(normalizeStoredItems(JSON.parse(raw)))
      }
    } catch {
      setItems([])
    } finally {
      setHasHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items, hasHydrated])

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
      estimatedSubtotal: items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
      addItem: (item) => {
        const quantity = sanitizeQuantity(item.quantity ?? 1)
        const unitPrice = sanitizeUnitPrice(item.unitPrice)

        setItems((previousItems) => {
          const index = previousItems.findIndex((entry) => entry.productId === item.productId)
          if (index === -1) {
            return [...previousItems, { ...item, unitPrice, quantity }]
          }

          const nextItems = [...previousItems]
          const current = nextItems[index]
          nextItems[index] = {
            ...current,
            quantity: sanitizeQuantity(current.quantity + quantity),
            name: item.name,
            presentation: item.presentation,
            brand: item.brand,
            imageUrl: item.imageUrl,
            slug: item.slug,
            unitPrice,
          }
          return nextItems
        })
      },
      updateQuantity: (productId, quantity) => {
        const nextQuantity = Math.floor(quantity)
        setItems((previousItems) => {
          if (nextQuantity <= 0) {
            return previousItems.filter((item) => item.productId !== productId)
          }

          return previousItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity: sanitizeQuantity(nextQuantity) }
              : item,
          )
        })
      },
      removeItem: (productId) => {
        setItems((previousItems) => previousItems.filter((item) => item.productId !== productId))
      },
      clearCart: () => {
        setItems([])
      },
      hasHydrated,
    }
  }, [items, hasHydrated])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }

  return context
}
