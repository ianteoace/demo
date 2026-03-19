import { formatArsAmount } from "@/lib/currency"

type OrderNotificationItem = {
  productNameSnapshot: string
  presentationSnapshot: string | null
  unitPriceSnapshot: number
  quantity: number
}

type SendNewOrderNotificationEmailInput = {
  id: string
  customerName: string
  phone: string
  email: string | null
  totalItems: number
  totalAmountSnapshot: number
  items: OrderNotificationItem[]
}

function buildPlainTextBody(payload: SendNewOrderNotificationEmailInput): string {
  const lines = payload.items.map((item) => {
    const presentation = item.presentationSnapshot ? ` - ${item.presentationSnapshot}` : ""
    const subtotal = item.unitPriceSnapshot * item.quantity
    return `- ${item.productNameSnapshot}${presentation} | ${item.quantity} u | ${formatArsAmount(subtotal)}`
  })

  return [
    "Nuevo pedido mayorista recibido",
    "",
    `Pedido: ${payload.id}`,
    `Cliente: ${payload.customerName}`,
    `Telefono: ${payload.phone}`,
    `Email: ${payload.email || "No informado"}`,
    `Total unidades: ${payload.totalItems}`,
    `Total estimado: ${formatArsAmount(payload.totalAmountSnapshot)}`,
    "",
    "Items:",
    ...lines,
  ].join("\n")
}

function buildHtmlBody(payload: SendNewOrderNotificationEmailInput): string {
  const rows = payload.items
    .map((item) => {
      const subtotal = item.unitPriceSnapshot * item.quantity
      return `<tr>
<td style=\"padding:8px;border-bottom:1px solid #e4e4e7;\">${item.productNameSnapshot}</td>
<td style=\"padding:8px;border-bottom:1px solid #e4e4e7;\">${item.presentationSnapshot || "-"}</td>
<td style=\"padding:8px;border-bottom:1px solid #e4e4e7;\">${item.quantity}</td>
<td style=\"padding:8px;border-bottom:1px solid #e4e4e7;\">${formatArsAmount(item.unitPriceSnapshot)}</td>
<td style=\"padding:8px;border-bottom:1px solid #e4e4e7;\">${formatArsAmount(subtotal)}</td>
</tr>`
    })
    .join("")

  return `
<div style="font-family:Arial,sans-serif;color:#18181b;line-height:1.45;max-width:760px;">
  <h2 style="margin:0 0 12px;">Nuevo pedido mayorista recibido</h2>
  <p style="margin:0 0 4px;"><strong>Pedido:</strong> ${payload.id}</p>
  <p style="margin:0 0 4px;"><strong>Cliente:</strong> ${payload.customerName}</p>
  <p style="margin:0 0 4px;"><strong>Telefono:</strong> ${payload.phone}</p>
  <p style="margin:0 0 4px;"><strong>Email:</strong> ${payload.email || "No informado"}</p>
  <p style="margin:0 0 4px;"><strong>Total unidades:</strong> ${payload.totalItems}</p>
  <p style="margin:0 0 16px;"><strong>Total estimado:</strong> ${formatArsAmount(payload.totalAmountSnapshot)}</p>

  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f4f4f5;text-align:left;">
        <th style="padding:8px;">Producto</th>
        <th style="padding:8px;">Presentacion</th>
        <th style="padding:8px;">Cantidad</th>
        <th style="padding:8px;">Precio unitario</th>
        <th style="padding:8px;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`
}

export async function sendNewOrderNotificationEmail(payload: SendNewOrderNotificationEmailInput): Promise<void> {
  const to = process.env.ORDER_NOTIFICATION_EMAIL?.trim()
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.ORDER_NOTIFICATION_FROM_EMAIL?.trim()

  if (!to) {
    console.warn("[orders-email] ORDER_NOTIFICATION_EMAIL no configurado; se omite notificacion")
    return
  }

  if (!apiKey || !from) {
    console.warn("[orders-email] Falta RESEND_API_KEY u ORDER_NOTIFICATION_FROM_EMAIL; se omite notificacion")
    return
  }

  const subject = `Nuevo pedido mayorista #${payload.id.slice(0, 8)} - ${payload.customerName}`

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: buildPlainTextBody(payload),
      html: buildHtmlBody(payload),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Resend respondio ${response.status}: ${errorBody}`)
  }
}
