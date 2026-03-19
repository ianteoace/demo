"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { checkRateLimit, getRateLimitClientKey } from "@/lib/rate-limit"
import { parseInquiryFormData, type InquiryActionState } from "@/types/inquiry"

const INQUIRY_RATE_LIMIT_MAX_REQUESTS = 8
const INQUIRY_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

export async function createInquiryAction(
  productId: string | null,
  _prevState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const parsed = parseInquiryFormData(formData)
  if ("error" in parsed) {
    return { error: parsed.error, success: null }
  }

  const rateLimitKey = await getRateLimitClientKey("public-inquiry")
  const rateLimitResult = checkRateLimit({
    key: rateLimitKey,
    limit: INQUIRY_RATE_LIMIT_MAX_REQUESTS,
    windowMs: INQUIRY_RATE_LIMIT_WINDOW_MS,
  })
  if (!rateLimitResult.ok) {
    return {
      error: `Demasiadas consultas en poco tiempo. Intenta nuevamente en ${rateLimitResult.retryAfterSeconds} segundos.`,
      success: null,
    }
  }

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    })

    if (!product || !product.isActive) {
      return {
        error: "El producto asociado no esta disponible para consultas.",
        success: null,
      }
    }
  }

  await prisma.inquiry.create({
    data: {
      ...parsed.data,
      productId,
      status: "NEW",
    },
  })

  revalidatePath("/dashboard/inquiries")

  return {
    error: null,
    success: "Consulta enviada. Nuestro equipo comercial te respondera a la brevedad.",
  }
}
