import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/order-notification-email", () => ({
  sendNewOrderNotificationEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/lib/request-context", () => ({
  getRequestClientIp: vi.fn().mockResolvedValue("127.0.0.1"),
}))

import { prisma } from "@/lib/prisma"
import { createOrderAction } from "@/app/(public)/checkout/actions"
import { EMPTY_CHECKOUT_ACTION_STATE } from "@/types/order"

const createdCategoryIds: string[] = []
const createdProductIds: string[] = []
const createdOrderIds: string[] = []

function buildCheckoutFormData(items: Array<{ productId: string; quantity: number }>) {
  const formData = new FormData()
  formData.set("customerName", "QA Test")
  formData.set("phone", "+5491112345678")
  formData.set("company", "SoloAderezos QA")
  formData.set("email", "qa@soloaderezos.com")
  formData.set("notes", "Test")
  formData.set("website", "")
  formData.set("items", JSON.stringify(items))
  return formData
}

async function createTestProduct(options: { isActive: boolean; unitPrice?: number }) {
  const uid = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`

  const category = await prisma.category.create({
    data: {
      name: `QA Cat ${uid}`,
      slug: `qa-cat-${uid}`,
      isActive: true,
    },
  })
  createdCategoryIds.push(category.id)

  const product = await prisma.product.create({
    data: {
      name: `QA Product ${uid}`,
      slug: `qa-product-${uid}`,
      categoryId: category.id,
      unitPrice: options.unitPrice ?? 1000,
      isActive: options.isActive,
      isOnSale: false,
      isFeatured: false,
    },
  })
  createdProductIds.push(product.id)

  return product
}

afterEach(async () => {
  if (createdOrderIds.length > 0) {
    await prisma.order.deleteMany({
      where: { id: { in: createdOrderIds } },
    })
    createdOrderIds.length = 0
  }

  if (createdProductIds.length > 0) {
    await prisma.product.deleteMany({
      where: { id: { in: createdProductIds } },
    })
    createdProductIds.length = 0
  }

  if (createdCategoryIds.length > 0) {
    await prisma.category.deleteMany({
      where: { id: { in: createdCategoryIds } },
    })
    createdCategoryIds.length = 0
  }
})

describe("createOrderAction", () => {
  it("devuelve error si el carrito llega vacio", async () => {
    const formData = buildCheckoutFormData([])

    const result = await createOrderAction(EMPTY_CHECKOUT_ACTION_STATE, formData)

    expect(result.error).toBe("El carrito enviado es invalido o esta vacio.")
    expect(result.orderId).toBeNull()
  })

  it("impide crear pedido con menos de 50 unidades", async () => {
    const product = await createTestProduct({ isActive: true })
    const formData = buildCheckoutFormData([{ productId: product.id, quantity: 10 }])

    const result = await createOrderAction(EMPTY_CHECKOUT_ACTION_STATE, formData)

    expect(result.error).toContain("pedido minimo mayorista")
    expect(result.orderId).toBeNull()
  })

  it("impide crear pedido si el producto esta inactivo", async () => {
    const product = await createTestProduct({ isActive: false })
    const formData = buildCheckoutFormData([{ productId: product.id, quantity: 60 }])

    const result = await createOrderAction(EMPTY_CHECKOUT_ACTION_STATE, formData)

    expect(result.error).toContain("productos inactivos")
    expect(result.orderId).toBeNull()
  })

  it("crea pedido valido y persiste publicToken", async () => {
    const product = await createTestProduct({ isActive: true, unitPrice: 1450 })
    const formData = buildCheckoutFormData([{ productId: product.id, quantity: 50 }])

    const result = await createOrderAction(EMPTY_CHECKOUT_ACTION_STATE, formData)

    expect(result.error).toBeNull()
    expect(result.orderId).toBeTruthy()
    expect(result.confirmationToken).toBeTruthy()

    const order = await prisma.order.findUnique({
      where: { id: result.orderId! },
      include: { orderItems: true },
    })

    expect(order).not.toBeNull()
    expect(order?.publicToken).toBe(result.confirmationToken)
    expect(order?.totalItems).toBe(50)
    expect(order?.orderItems[0]?.unitPriceSnapshot).toBe(1450)

    createdOrderIds.push(result.orderId!)
  })
})
