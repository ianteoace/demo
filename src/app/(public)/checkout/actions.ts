"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"

import { logAppError, logBusinessEvent } from "@/lib/observability"
import { sendNewOrderNotificationEmail } from "@/lib/order-notification-email"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getRateLimitClientKey } from "@/lib/rate-limit"
import { hasReachedWholesaleMinimum, WHOLESALE_MINIMUM_ITEMS } from "@/lib/wholesale-order"
import { EMPTY_CHECKOUT_ACTION_STATE, parseCheckoutFormData, type CheckoutActionState } from "@/types/order"

const CHECKOUT_RATE_LIMIT_MAX_REQUESTS = 5
const CHECKOUT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

export async function createOrderAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  try {
    const parsed = parseCheckoutFormData(formData)

    if ("error" in parsed) {
      logAppError("checkout.create_order.validation", parsed.error, undefined, "warn")
      return { ...EMPTY_CHECKOUT_ACTION_STATE, error: parsed.error }
    }

    const rateLimitKey = await getRateLimitClientKey("public-checkout")
    const rateLimitResult = checkRateLimit({
      key: rateLimitKey,
      limit: CHECKOUT_RATE_LIMIT_MAX_REQUESTS,
      windowMs: CHECKOUT_RATE_LIMIT_WINDOW_MS,
    })
    if (!rateLimitResult.ok) {
      const message = `Demasiados intentos de checkout. Intenta nuevamente en ${rateLimitResult.retryAfterSeconds} segundos.`
      logAppError("checkout.create_order.rate_limit", message, {
        retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      }, "warn")
      return {
        ...EMPTY_CHECKOUT_ACTION_STATE,
        error: message,
      }
    }

    const mergedItems = new Map<string, number>()
    for (const item of parsed.data.items) {
      mergedItems.set(item.productId, (mergedItems.get(item.productId) || 0) + item.quantity)
    }

    const productIds = [...mergedItems.keys()]
    if (productIds.length === 0) {
      const message = "El carrito esta vacio. Agrega productos antes de confirmar el pedido."
      logAppError("checkout.create_order.empty_cart", message, undefined, "warn")
      return {
        ...EMPTY_CHECKOUT_ACTION_STATE,
        error: message,
      }
    }

    const productsFromDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        presentation: true,
        unitPrice: true,
        isActive: true,
      },
    })

    const productsById = new Map(productsFromDb.map((product) => [product.id, product]))

    const missingProductIds = productIds.filter((productId) => !productsById.has(productId))
    if (missingProductIds.length > 0) {
      const message = "Hay productos del carrito que ya no existen. Actualiza el carrito e intenta nuevamente."
      logAppError("checkout.create_order.missing_products", message, { missingProductIds }, "warn")
      return {
        ...EMPTY_CHECKOUT_ACTION_STATE,
        error: message,
      }
    }

    const inactiveProducts = productsFromDb.filter((product) => !product.isActive)
    if (inactiveProducts.length > 0) {
      const message = "Hay productos inactivos en el carrito. Revisa el carrito antes de confirmar el pedido."
      logAppError("checkout.create_order.inactive_products", message, {
        productIds: inactiveProducts.map((item) => item.id),
      }, "warn")
      return {
        ...EMPTY_CHECKOUT_ACTION_STATE,
        error: message,
      }
    }

    const orderItemsData = productIds.map((productId) => {
      const product = productsById.get(productId)

      if (!product) {
        throw new Error("Missing product while creating order")
      }

      return {
        productId,
        productNameSnapshot: product.name,
        unitPriceSnapshot: product.unitPrice,
        presentationSnapshot: product.presentation,
        quantity: mergedItems.get(productId) || 1,
      }
    })

    const totalItems = orderItemsData.reduce((acc, item) => acc + item.quantity, 0)
    if (!hasReachedWholesaleMinimum(totalItems)) {
      const message = `El pedido minimo mayorista es de ${WHOLESALE_MINIMUM_ITEMS} unidades totales.`
      logAppError("checkout.create_order.minimum_not_reached", message, { totalItems }, "warn")
      return {
        ...EMPTY_CHECKOUT_ACTION_STATE,
        error: message,
      }
    }
    const totalAmountSnapshot = orderItemsData.reduce(
      (acc, item) => acc + item.quantity * item.unitPriceSnapshot,
      0,
    )

    const order = await prisma.order.create({
      data: {
        publicToken: randomUUID(),
        customerName: parsed.data.customerName,
        company: parsed.data.company,
        phone: parsed.data.phone,
        email: parsed.data.email,
        notes: parsed.data.notes,
        status: "PENDING",
        totalItems,
        totalAmountSnapshot,
        orderItems: {
          create: orderItemsData,
        },
      },
      select: { id: true, publicToken: true },
    })

    logBusinessEvent("order.created", {
      orderId: order.id,
      customerName: parsed.data.customerName,
      totalItems,
      totalAmountSnapshot,
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/orders")

    try {
      await sendNewOrderNotificationEmail({
        id: order.id,
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        totalItems,
        totalAmountSnapshot,
        items: orderItemsData.map((item) => ({
          productNameSnapshot: item.productNameSnapshot,
          presentationSnapshot: item.presentationSnapshot,
          unitPriceSnapshot: item.unitPriceSnapshot,
          quantity: item.quantity,
        })),
      })
    } catch (error) {
      logAppError("checkout.create_order.email_notification", error, {
        orderId: order.id,
      })
    }

    return {
      error: null,
      orderId: order.id,
      confirmationToken: order.publicToken,
    }
  } catch (error) {
    logAppError("checkout.create_order", error)
    return {
      ...EMPTY_CHECKOUT_ACTION_STATE,
      error: "No se pudo crear el pedido. Intenta nuevamente.",
    }
  }
}
